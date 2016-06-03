/* @flow */

import { TABLES, ROLES } from '../../lib/schema';
import { bus, cache } from '../../core-server';
import * as Constants from '../../lib/Constants';
import promisify from '../../lib/promisify';
import log from 'winston';
import User from '../../models/user';
import jsonop from 'jsonop';

const getEntityAsync = promisify(cache.getEntity.bind(cache));

bus.on('change', (changes, next) => {
	if (!changes.entities) {
		next();
		return;
	}
	const promises = [];
	for (const id in changes.entities) {
		const entity = changes.entities[id];

		// 1. Increment children counts on parents
		if (
			entity.type === Constants.TYPE_TEXT ||
			entity.type === Constants.TYPE_THREAD
		) {
			if (!entity.createTime || entity.createTime !== entity.updateTime || (!entity.parents || !entity.parents.length)) {
				continue;
			}
			let inc;
			log.info('Count module reached: ', entity);
			if (entity.createTime === entity.updateTime) {
				log.info('increase count');
				inc = 1;
			} else if (entity.deleteTime) {
				inc = -1;
			}

			const parent = changes.entities[entity.parents[0]] || {};
			parent.counts = parent.counts || {};
			parent.counts.children = [ inc, '$add' ];

			parent.id = entity.parents[0];
			parent.type = (entity.type === Constants.TYPE_TEXT) ?
				Constants.TYPE_THREAD : Constants.TYPE_ROOM;

			changes.entities[entity.parents[0]] = jsonop.merge(changes.entities[entity.parents[0]], parent);

			// 2. Increment text/thread count of user

			const user = new User({ id: entity.creator });

			user.counts = {};
			user.counts[TABLES[entity.type]] = [ inc, '$add' ];
			user.id = entity.creator;
			changes.entities[entity.creator] = jsonop.merge(changes.entities[entity.creator], user);
		}

		 // 3. Increment related counts on items

		if (
			entity.type === Constants.TYPE_TEXTREL ||
			entity.type === Constants.TYPE_THREADREL ||
			entity.type === Constants.TYPE_ROOMREL ||
			entity.type === Constants.TYPE_PRIVREL ||
			entity.type === Constants.TYPE_TOPICREL
		) {
			if (!entity.id) entity.id = entity.user + '_' + entity.item;
			promises.push(getEntityAsync(entity.id).then(result => {
				let exist = [], inc = 1;

				// console.log("result: ", result);
				if (result) {
					entity.roles.forEach((role) => {
						if (result.roles.indexOf(role) === -1) {
							exist.push(role);
						}
					});

					if (entity.roles.length === 0) {
						// console.log('got roles empty');
						inc = -1;
						exist = result.roles;
					}

					if (exist.length === 0) {
						return;
					}
				} else {
					exist = entity.roles;
				}

				const item = changes.entities[entity.item] || {};

				item.counts = item.counts || {};

				exist.forEach((role) => {
					if (ROLES[role]) {
						item.counts[ROLES[role]] = [ inc, '$add' ];
					}
				});

				item.id = entity.item;

				switch (entity.type) {
				case Constants.TYPE_TEXTREL:
					item.type = Constants.TYPE_TEXT;
					break;
				case Constants.TYPE_THREADREL:
					item.type = Constants.TYPE_THREAD;
					break;
				case Constants.TYPE_ROOMREL:
					item.type = Constants.TYPE_ROOM;
					break;
				case Constants.TYPE_PRIVREL:
					item.type = Constants.TYPE_PRIV;
					break;
				case Constants.TYPE_TOPICREL:
					item.type = Constants.TYPE_TOPIC;
					break;
				}
				changes.entities[entity.item] = item;
			}));
		}
	}

	Promise.all(promises).then(
		() => next(),
		err => next(err),
	);
}, Constants.APP_PRIORITIES.COUNT);
log.info('Count module ready.');
