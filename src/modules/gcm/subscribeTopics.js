/* @flow */
/* eslint dot-notation: 0*/
import { config, bus, cache } from '../../core-server';
import * as Constants from '../../lib/Constants';
import Counter from '../../lib/counter';
import Logger from '../../lib/logger';
import values from 'lodash/values';
import request from 'request';
import { getTokenFromSession, updateUser } from './handleUpstreamMessage';
const authKey = 'key=' + config.gcm.apiKey, log = new Logger(__filename);
const options = {
	url: 'https://iid.googleapis.com/iid/v1:batchAdd',
	json: true,
	method: 'POST',
	headers: {
		Authorization: authKey,
	},
	body: {},
};

export function getIIDInfo(iid: String, cb: Function) {
	request({
		url: `https://iid.googleapis.com/iid/info/${iid}?details=true`,
		method: 'GET',
		headers: {
			Authorization: authKey,
		},
	}, cb);
}

function unsubscribeTopics (data, cb) {
	log.info('unsubscribe data: ', data);
	let iids = [];

	if (Array.isArray(data.iid)) {
		iids = data.iid;
	} else {
		iids.push(data.iid);
	}

	if (data.topic) {
		request({
			...options,
			url: 'https://iid.googleapis.com/iid/v1:batchRemove',
			body: {
				registration_tokens: iids,
				to: '/topics/' + data.topic,
			},
		}, (err, rspns, bdy) => {
			if (!err) {
				log.info('unsubscribed from ', data.topic || '');
				log.info(bdy);
			} else {
				log.error(err);
			}
		});
	} else {
		iids.forEach(iid => {
			getIIDInfo(iid, async (e, r, b) => {
				if (e || !b) {
					log.debug(e);
					return;
				}
				if (b && !JSON.parse(b).rel) {
					log.debug(e, JSON.parse(b));
					return;
				}
				try {
					// unsubscribe thread topics
					await Object.keys(JSON.parse(b).rel.topics).map(topic => {
						if (!/thread-/.test(topic)) {
							log.debug('does not match thread');
							return null;
						}

						return new Promise((resolve, reject) => {
							request({
								...options,
								url: 'https://iid.googleapis.com/iid/v1:batchRemove',
								body: {
									registration_tokens: [ iid ],
									to: '/topics/' + topic,
								},
							}, (err, rspns, bdy) => {
								if (!err) {
									log.info('unsubscribed from ', topic);
									log.info(bdy);
									resolve();
								} else {
									log.error(err);
									reject(err);
								}
							});
						});
					});
				} catch (err) {
					// ignore
				}
				if (cb) {
					cb();
				}
			});
		});
	}

}

export function subscribe (userRel: Object) {
	const gcm = userRel.params ? userRel.params.gcm : null;
	const tokens = values(gcm);
	function register () {

		log.info('tokens: ', tokens);
		request({
			...options,
			body: {
				registration_tokens: tokens,
				to: '/topics/' + userRel.topic,
			},
		}, (error, response, body) => {
			if (error) {
				log.error('error subscribing to topic: ', userRel.topic, tokens, error);
				if (error.type === 'TOO_MANY_TOPICS') {
					log.info('unsubscribe few old topics');
					unsubscribeTopics({ iid: tokens }, () => {
						subscribe(userRel);
					});
				} else {
					log.error(userRel.params.id + 'can not subscribe to topic', error, response, body);

				}
			}
			if (body && body.error) {
				log.error(body, userRel.topic, response);
				console.log(options);
			} else {
				log.info(userRel.params + ' is subscribed to ' + userRel.topic);
				// getIIDInfo(token, (e, r, b) => {
				// 	log.info(b);
				// 	// return;
				// });
			}
		}).on('error', (err) => {
			log.error('on error here:', err);
			register();
		});
	}
	if (!gcm) {
		log.debug('No gcm found for user retrying from saved token...');
		const data = getTokenFromSession();
		if (data.error) log.info(data.error);
		updateUser({ data }, (error) => {
			// console.log("dta: ", data);
			if (!error) {
				register();
				return;
			} else {
				log.info('No gcm found for user');
			}
		});
	} else {
		register();
	}

}

function mapRelsAndSubscriptions(entity) {
	log.info('map here gcm');
	cache.getEntity(entity.user, (err, user) => {
		log.info('user gcm: ', user);
		if (err || !user || !user.params || !user.params.gcm) return;
		const tokens = values(user.params.gcm);
		log.info('token: ', tokens);
		cache.query({
			type: 'roomrel',
			filter: {
				user: user.id,
				roles_cts: [ Constants.ROLE_FOLLOWER ]
			},
			order: 'createTime',
		}, [ -Infinity, Infinity ], (error, rels) => {
			log.info('rels gcm: ', rels, err);
			if (err) { return; }
			tokens.forEach((token) => {
				function callback (e, r, b) {
					try {
						let parsedBody = JSON.parse(b);

						if(e || !b || !parsedBody.rel) {
							log.error(e, parsedBody);
							return;
						}
						const subscribedRooms = Object.keys(parsedBody.rel.topics).filter(topic => {
							return /room-/.test(topic);
						}).map(room => {
							return room.replace('room-', '');
						});
						const roomsFollowing = rels.arr.map((room) => {
							return room.item;
						});
						log.info('all here: ', subscribedRooms, roomsFollowing);

						const roomsNotSubscribed = roomsFollowing.filter(room => {
							return subscribedRooms.indexOf(room) === -1;
						});
						const notFollowingSubscribed = subscribedRooms.filter(room => {
							return roomsFollowing.indexOf(room) === -1;
						});
						log.info('rooms following but not subscribed: ', roomsNotSubscribed);
						log.info('rooms not following but subscribed: ', notFollowingSubscribed);

						if (roomsNotSubscribed.length > 0) {
							roomsNotSubscribed.forEach(room => {
								subscribe({
									params: user.params,
									topic: 'room-' + room,
								});
							});
						}

						if (notFollowingSubscribed.length > 0) {
							notFollowingSubscribed.forEach(room => {
								unsubscribeTopics({ iid: token, topic: 'room-' + room });
							});
						}
					} catch(er) {
						log.error('Error parsing body: ', er, b);
					}
				}
				getIIDInfo(token, callback);
			});
		});
	});
}

function handleSubscription(changes, next) {
	const counter = new Counter();

	if (!changes.entities || !config.gcm.apiKey) {
		next();
		return;
	}
	// console.log("chandra: ", changes);
	for (const i in changes.entities) {
		const entity = changes.entities[i];

		if (entity.type === Constants.TYPE_ROOMREL) {
			// console.log('ksdfhjhadf : ', entity);
			mapRelsAndSubscriptions(entity);
			if (!entity.createTime || entity.createTime !== entity.updateTime) {
				if (entity.roles && entity.roles.length > 0) {
					log.info('Not created now, return', entity);
					continue;
				}

			}
			let user = changes.entities[entity.user];

			if (!user) {
				counter.inc();
				cache.getEntity(entity.user, (e, u) => {
					user = u;
					counter.dec();
				});
			}
			counter.then(() => {
				if (
					entity.roles && entity.roles.length === 0 /* ||
					entity.roles.indexOf(Constants.ROLE_FOLLOWER) === -1*/
				) {
					log.info('Got unfollow, unsubscribe from topics');
					const gcm = user.params && user.params.gcm;
					const	tokens = values(gcm);
					const topic = entity.type === Constants.TYPE_ROOMREL ? 'room-' +
					 entity.item : 'thread-' + entity.item;
					tokens.forEach((token) => {
						unsubscribeTopics({ iid: token, topic }, () => {
							log.info('Unsubscribed from topic: ', topic);
						});
					});
					return;
				} else if (entity.roles && entity.roles.length > 0) {
					// console.log("jhgf shfg: ", entity)
					log.info('subscribe ' + user.id + ' to ' + entity.item);
					subscribe({
						params: user.params || {},
						topic: entity.type === Constants.TYPE_ROOMREL ? 'room-' + entity.item :
						'thread-' + entity.item,
					});
				}
			});
		}
	}
	next();
}

// console.log("Constants.APP_PRIORITIES.GCM", Constants.APP_PRIORITIES.GCM);
bus.on('change', handleSubscription, Constants.APP_PRIORITIES.GCM);
