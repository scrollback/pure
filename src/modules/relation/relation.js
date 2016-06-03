/* @flow */

import { bus, cache } from '../../core-server';
import * as Constants from '../../lib/Constants';
import { textrel, threadrel } from '../../models/models';
import Counter from '../../lib/counter';
import log from 'winston';

bus.on('change', (changes, next) => {
	if (!changes.entities) {
		next();
		return;
	}

	const counter = new Counter();

	for (const id in changes.entities) {
		const entity = changes.entities[id];
		let text, role, user;

		if (entity.type === Constants.TYPE_TEXT) {

			if (entity.createTime !== entity.updateTime || (!entity.parents || !entity.parents.length)) {
				continue;
			}
			counter.inc();
			const relationId = entity.creator + '_' + entity.parents[0];
			let promises;

			if (entity.body.match(/@\w+/g)) {
				const mentions = entity.body.match(/@\w+/g);

				log.info('mention: ', mentions);

				promises = mentions.map((u) => {
					return new Promise((resolve, reject) => {
						cache.getEntity(u.slice(1), (err, usr) => {
							if (err) {
								reject(err);
								return;
							}
							if (!usr) {
								resolve();
								return;
							}
							log.info('got user: ', usr);
							const textRel = {
								item: entity.id,
								user: usr.id,
								type: Constants.TYPE_TEXTREL,
								roles: [ Constants.ROLE_MENTIONED ],
							};
							const relation = new textrel(textRel);

							log.info('create relation on mention: ', relation, relation.id);
							resolve(relation);
						});
					});
				});

				mentions.forEach((usr) => {
					promises.push(new Promise((resolve, reject) => {
						const relId = usr.slice(1) + '_' + entity.parents[0];
						cache.getEntity(relId, (e, r) => {
							log.info('Got previous relation for mention: ', e, r, relId);
							if (e) {
								reject(e);
								return;
							}
							if (r && r.roles.indexOf(Constants.ROLE_MENTIONED) > -1) {
								log.info(relId, 'this user is already mentioned. Return');
								resolve();
								return;
							}
							const threadRel = {
								item: entity.parents[0],
								user: usr.slice(1),
								type: Constants.TYPE_THREADREL,
								roles: [ Constants.ROLE_MENTIONED ],
							};
							const threadRelation = new threadrel(threadRel);

							log.info('Thread Relation created:', threadRelation);
							resolve(threadRelation);
						});
					}));
				});

			} else {
				promises = [];
			}
			promises.push(new Promise((resolve, reject) => {
				cache.getEntity(relationId, (err, r) => {
					log.info('Got previous relation for follower: ', err, r, relationId);
					if (err) {
						reject(err);
						return;
					}
					if (
						r && r.roles.indexOf(Constants.ROLE_FOLLOWER) > -1
					) {
						log.info(relationId, 'this user is already a follower. Return');
						resolve();
						return;
					}
					text = entity;
					role = [ Constants.ROLE_FOLLOWER ];
					user = entity.creator;
					const threadRel = {
						item: text.parents[0],
						user,
						type: Constants.TYPE_THREADREL,
						roles: role,
					};
					const relation = new threadrel(threadRel);

					log.info('create relation on text: ', relation, relation.id);
					resolve(relation);
				});
			}));

			Promise.all(promises).then(relations => {
				log.info('all promises resolved');
				relations.forEach(relation => {
					if (!relation) return;
					log.info('relation.id: ', relation.id);
					changes.entities[relation.id] = relation;
				});
				counter.dec();
			}).catch((err) => {
				log.info('caught error: ', err);
				counter.err(err);
			});
		} else if (entity.type === Constants.TYPE_THREAD) {
			if (!entity.createTime || entity.createTime !== entity.updateTime) {
				continue;
			}
			const threadRel = {
				user: entity.creator,
				item: entity.id,
				type: Constants.TYPE_THREADREL,
				roles: [ Constants.ROLE_FOLLOWER ],
			};
			const relation = new threadrel(threadRel);
			changes.entities[relation.id] = relation;
			log.info('create relation between thread and the creator: ', relation.id);
		}
	}
	counter.then(next);
}, Constants.APP_PRIORITIES.RELATIONS);
log.info('Relation module ready');
