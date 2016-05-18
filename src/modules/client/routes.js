/* @flow */

import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import route from 'koa-route';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ServerHTML from './ServerHTML';
import promisify from '../../lib/promisify';
import { convertURLToRoute } from '../../lib/Route';
import { bus, cache, config } from '../../core-server';

const PLAY_STORE_LINK = `https://play.google.com/store/apps/details?id=${config.package_name}`;

const promo = handlebars.compile(fs.readFileSync(path.join(__dirname, '../../../templates/promo.hbs')).toString());
const getEntityAsync = promisify(cache.getEntity.bind(cache));

bus.on('http/init', app => {
	app.use(route.get('*', function *() {
		const query = this.request.query;

		if (query && query.download_app) {
			this.response.redirect(query.referrer ? `${PLAY_STORE_LINK}&referrer=${query.referrer}` : PLAY_STORE_LINK);
			return;
		}

		const { name, props } = convertURLToRoute(this.request.href);

		let title, description;

		if (props) {
			switch (name) {
			case 'room': {
				const room = yield getEntityAsync(props.room);

				if (room) {
					title = `The ${room.name} community is on ${config.app_name}.`;
					description = `Install the ${config.app_name} app to join.`;
				}

				break;
			}
			case 'chat': {
				const thread = yield getEntityAsync(props.thread);

				if (thread) {
					title = thread.name;
					description = `Install the ${config.app_name} app to join.`;
				}

				break;
			}
			}
		}

		this.body = '<!DOCTYPE html>' + ReactDOMServer.renderToStaticMarkup(
			<ServerHTML
				locale='en'
				title={title || config.app_name}
				description={description || ''}
				body={promo({
					title,
					description,
				})}
				image={`${this.request.origin}/s/assets/thumbnail.png`}
				permalink={this.request.href}
				styles={[
					'//fonts.googleapis.com/css?family=Alegreya+Sans:300,500,900',
					'/s/styles/home.css'
				]}
			/>
		);
	}));
});
