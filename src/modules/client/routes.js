/* @flow */

import route from 'koa-route';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Home from '../../ui/components/views/Home.web';
import ServerHTML from './ServerHTML';
import promisify from '../../lib/promisify';
import { convertURLToRoute } from '../../lib/Route';
import { bus, cache, config } from '../../core-server';

const PLAY_STORE_LINK = `https://play.google.com/store/apps/details?id=${config.package_name}`;

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
			case 'room':
				const room = yield getEntityAsync(props.room);

				if (room) {
					title = `I just joined ${config.app_name}`;
					description = `Join me in exploring the ${room.name} community `;
				} else {
					title = `Join me on ${config.app_name}`;
					description = '';
				}

				break;
			case 'chat':
				const thread = yield getEntityAsync(props.thread);

				if (thread) {
					title = thread.name;
					description = `Join me in this conversation on ${config.app_name}`;
				} else {
					title = `Join me on ${config.app_name}`;
					description = '';
				}

				break;
			}
		}

		if (title) {
			this.body = '<!DOCTYPE html>' + ReactDOMServer.renderToStaticMarkup(
				<ServerHTML
					locale='en'
					title={title}
					description={description}
					body={ReactDOMServer.renderToString(
						<Home
							title={title}
							description={description}
							url={PLAY_STORE_LINK}
							radiumConfig={{ userAgent: this.headers['user-agent'] }}
						/>
					)}
					image={`${this.request.origin}/assets/thumbnail.png`}
					permalink={this.request.href}
				/>
			);
		}
	}));
});
