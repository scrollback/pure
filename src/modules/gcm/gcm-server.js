/* @flow */

import { connect } from './xmpp';
import { bus, config, cache } from '../../core-server';
import log from 'winston';
import * as Constants from '../../lib/Constants';
import uid from '../../lib/uid-server';
import Counter from '../../lib/counter';
import handleUpstreamMessage from './handleUpstreamMessage';
import createStanza from './createStanza';
import { convertRouteToURL } from '../../lib/Route';
import type { Note } from '../../lib/schemaTypes';
import './subscribeTopics';

let client;

if (config.gcm.senderId) {
	log.info('GCM module ready.');
	connect((e, c) => {
		if (e) {
			log.error(e);
			return;
		} else {
			client = c;
			handleUpstreamMessage(c);
		}
	});
} else {
	log.info('GCM module not enabled');
}

function sendStanza(changes, entity) {
	// console.log('gcm server is here')
	if (entity.type === Constants.TYPE_THREAD) {
		if (!entity.createTime || entity.createTime !== entity.updateTime) {
			log.info('not new thread: ', entity);
			return;
		}
		const counter = new Counter();
		let room = changes.entities[entity.parents[0]];
		if (!room || !room.name) {
			counter.inc();
			cache.getEntity(entity.parents[0], (e, roomObj) => {
				room = roomObj;
				counter.dec();
			});
		}
		// console.log("sdjkfhjd g: ", entity)
		counter.then(() => {
			const title = room.name + ': ' + entity.creator + ' started a discussion',
				urlLink = config.server.protocol + '//' + config.server.host + convertRouteToURL({
					name: 'chat',
					props: {
						room: entity && entity.parents[0],
						thread: entity && entity.id,
					},
				});

			log.info('sending pushnotification for thread', entity, urlLink);
			const pushData: Note = {
				group: entity.id,
				count: 1,
				score: 10,
				data: {
					body: entity.name,
					creator: entity.creator,
					id: entity.id,
					room: {
						id: entity && entity.parents[0],
					},
					title,
					thread: {
						id: entity.id,
					},
					link: urlLink,
					picture: `${config.server.protocol}//${config.server.host}/i/picture?user=${entity.creator}&size=${128}`,
				},
				event: Constants.NOTE_THREAD,
				createTime: Date.now(),
				updateTime: Date.now(),
				type: entity.type,
			};

				// console.log("gcm entity:", pushData)
			client.send(createStanza(uid(), pushData));
		});
	}
	if (entity.type === Constants.TYPE_TEXT) {
		log.info('push notification for text: ', entity);
		if (entity.createTime !== entity.updateTime) {
			log.info('not new text: ', entity);
			return;
		}
		const counter = new Counter();

		let room = changes.entities[entity.parents[1]],
			thread = changes.entities[entity.parents[0]];

		if (!room || !thread) {
			if (!room || !room.name) {
				counter.inc();
				cache.getEntity(entity.parents[1], (e, r) => {
					room = r;
					counter.dec();
				});
			}

			if (!thread || !thread.name) {
				counter.inc();
				cache.getEntity(entity.parents[0], (e, t) => {
					thread = t;
					counter.dec();
				});
			}
		}

		counter.then(() => {
			const title = room.name + ': ' + entity.creator + ' replied in ' + thread.name,
				urlLink = config.server.protocol + '//' + config.server.host + convertRouteToURL({
					name: 'chat',
					props: {
						room: entity && entity.parents[1],
						thread: entity && entity.parents[0],
					},
				});

			log.info('pushnotification: ', entity, urlLink);
			const pushData: Note = {
				group: entity.id,
				count: 1,
				score: 30,
				data: {
					body: entity.body,
					creator: entity.creator,
					id: entity.id,
					room: {
						id: entity && entity.parents[1],
					},
					title,
					thread: {
						id: entity && entity.parents[0],
					},
					link: urlLink,
					picture: `${config.server.protocol}//${config.server.host}/i/picture?user=${entity.creator}&size=${128}`,
				},
				event: Constants.NOTE_REPLY,
				createTime: Date.now(),
				updateTime: Date.now(),
				type: entity.type,
			};

			log.info('sending pushnotification for text', pushData);
			client.send(createStanza(uid(), pushData));
		});
	}
	if (entity.type === Constants.TYPE_NOTE) {
		log.info('sending pushnotification for mention');
		client.send(createStanza(uid(), entity));
	}
}


// console.log("Constants.APP_PRIORITIES.GCM", Constants.APP_PRIORITIES.GCM);
bus.on('change', (changes) => {
	if (!changes.entities || !config.gcm.senderId) {
		return;
	}
	for (const i in changes.entities) {
		const entity = changes.entities[i];
		sendStanza(changes, entity);
	}
}, Constants.APP_PRIORITIES.GCM);
