/* @flow */

import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ServerHTML from './ServerHTML';
import promisify from '../../lib/promisify';
import { convertURLToRoute } from '../../lib/Route';
import { bus, cache, config } from '../../core-server';

const PLAY_STORE_LINK = `https://play.google.com/store/apps/details?id=${config.package_name}`;

const promo = handlebars.compile(fs.readFileSync(path.join(__dirname, '../../../templates/promo.hbs')).toString());
const getEntityAsync = promisify(cache.getEntity.bind(cache));
const queryEntityAsync = promisify(cache.query.bind(cache));
bus.on('http/init', app => {
	app.use(function *(next) {
		const query = this.request.query;
		let room, thread;
		if (query && query.download_app) {
			this.response.redirect(query.referrer ? `${PLAY_STORE_LINK}&referrer=${query.referrer}` : PLAY_STORE_LINK);
			return;
		}

		const { name, props } = convertURLToRoute(this.request.href);

		let title, description;

		if (props) {
			switch (name) {
			case 'room': {
				room = yield getEntityAsync(props.room);

				if (room) {
					title = `The ${room.name} community is on ${config.app_name}.`;
					description = `Install the ${config.app_name} app to join.`;
				}

				break;
			}
			case 'chat': {
				/* $FlowFixMe */
				[ thread, room ] = yield Promise.all([ getEntityAsync(props.thread), getEntityAsync(props.room) ]);

				if (thread) {
					title = thread.name;
					description = thread.body;
				}

				break;
			}
			}
		}
		const response: {
			room: ?Object;
			thread?: Object;
			texts?: Array<Object>;
			user?: Object;
			playstore: string;
			facebook: string;
		} = {
			room,
			playstore: PLAY_STORE_LINK + (this.request.search ? ('&referrer=' + encodeURIComponent(this.request.search.substr(1))) : ''),
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${this.request.href}`,
			twitter: `http://twitter.com/share?text=${encodeURIComponent(title || '')}&url=${encodeURIComponent(this.request.href)}`,
		};
		let image = `${this.request.origin}/s/assets/preview-thumbnail.png`;

		if (thread) {
			if (thread.counts.children < 10 || !thread.counts.children) thread.showAll = true;
			else thread.more = thread.counts.children - 10;
			const queryTexts = yield queryEntityAsync({
				type: 'text',
				filter: {
					parents_first: thread.id
				},
				order: 'createTime',
			}, [ -Infinity, Infinity ]);

			response.texts = queryTexts && queryTexts.arr ? queryTexts.arr.slice(0, 10) : [];
			if (thread.meta && thread.meta.photo) {
				image = thread.meta.photo.thumbnail_url;
				description = thread.counts && thread.counts.follower ? thread.counts.follower + 'people talking' : '';
			} else if (thread.meta && thread.meta.oembed) {
				const oEmbed = thread.meta.oembed;
				image = oEmbed.thumbnail_url;
				if (oEmbed.description) {
					description += '. ' + oEmbed.description;
				}
			}
			response.thread = thread;
			response.user = {
				id: thread.creator || '',
				picture: `/i/picture?user=${thread.creator || ''}&size=48`
			};
		}
		// console.log('response: ', response)
		this.body = '<!DOCTYPE html>' + ReactDOMServer.renderToStaticMarkup(
			<ServerHTML
				locale='en'
				title={title || config.app_name}
				description={description || ''}
				body={promo(response)}
				image={image}
				permalink={this.request.href}
				styles={[
					'//fonts.googleapis.com/css?family=Alegreya+Sans:300,500,900|Lato:400,700',
					'/s/styles/home.css'
				]}
				analytics={config.analytics}
			/>
		);

		yield *next;
	});
});
