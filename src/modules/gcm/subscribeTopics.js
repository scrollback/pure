/* @flow */
/* eslint dot-notation: 0*/
import { config, bus, Constants, cache } from '../../core-server';
import Counter from '../../lib/counter';
import log from 'winston';
import values from 'lodash/values';
import request from 'request';
import { getTokenFromSession, updateUser } from './handleUpstreamMessage';
const authKey = 'key=' + config.gcm.apiKey;
const options = {
	url: 'https://iid.googleapis.com/iid/v1:batchAdd',
	json: true,
	method: 'POST',
	headers: {
		Authorization: authKey
	},
	body: {}
};

export function getIIDInfo(iid: String, cb: Function) {
	request({
		url: `https://iid.googleapis.com/iid/info/${iid}?details=true`,
		method: 'GET',
		headers: {
			Authorization: authKey
		},
	}, cb);
}

function unsubscribeTopics (data, cb) {
	const iid = data.iid;

	if (data.topic) {
		request({
			...options,
			url: 'https://iid.googleapis.com/iid/v1:batchRemove',
			body: {
				registration_tokens: [ iid ],
				to: '/topics/' + data.topic
			}
		}, (err, rspns, bdy) => {
			if (!err) {
				log.info('unsubscribed from ', data.topic || '');
				log.info(bdy);
			} else {
				log.error(err);
			}
		});
	} else {
		getIIDInfo(iid, async (e, r, b) => {
			if (e) {
				log.error(e);
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
								to: '/topics/' + topic
							}
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
			cb();
		});
	}

}

export function subscribe (userRel: Object) {
	const gcm = userRel.params ? userRel.params.gcm : null;

	function register () {
		const tokens = values(gcm);

		log.info('tokens: ', tokens);
		tokens.forEach(token => {
			request({
				...options,
				body: {
					registration_tokens: [ token ],
					to: '/topics/' + userRel.topic
				}
			}, (error, response, body) => {
				if (error) {
					log.error('error subscribing to topic: ', userRel.topic, token, error);
					if (error.type === 'TOO_MANY_TOPICS') {
						log.info('unsubscribe few old topics');
						unsubscribeTopics({ iid: token }, () => {
							subscribe(userRel);
						});
					} else {
						log.error('can not subscribe to topic', error);
					}
				}
				if (body.error) {
					log.error(body, userRel.topic);
					// console.log(options);
				} else {
					// getIIDInfo(token, (e, r, b) => {
					// 	log.info(b);
					// 	// return;
					// });
				}
			});
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
function handleSubscription(changes, next) {
	const counter = new Counter();

	if (!changes.entities || !config.gcm.apiKey) {
		next();
		return;
	}
	// console.log("chandra: ", changes);
	for (const i in changes.entities) {
		const entity = changes.entities[i];

		if (
				entity.type === Constants.TYPE_THREADREL ||
				entity.type === Constants.TYPE_ROOMREL
			) {
			// console.log("ksdfhjhadf : ", entity);
			if (!entity.createTime || entity.createTime !== entity.updateTime) {
				log.info('Not created now, return', entity);
				continue;
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
					entity.roles && entity.roles.length === 0 ||
					entity.roles.indexOf(Constants.ROLE_FOLLOWER) === -1 &&
					entity.roles.indexOf(Constants.ROLE_CREATOR) === -1
				) {
					// log.info('Got unfollow, unsubscribe from topics');
					// const gcm = user.params && user.params.gcm;
					// const	tokens = values(gcm);
					// const topic = entity.type === Constants.TYPE_ROOMREL ? 'room-' +
					//  entity.item : 'thread-' + entity.item;
					// tokens.forEach((token) => {
					// 	unsubscribeTopics({ iid: token, topic }, () => {
					// 		log.info('Unsubscribed from topic: ', topic);
					// 	});
					// });
					// console.log("sdjfh jsghf gh fdgfm: ", Constants.ROLE_OWNER, entity.roles.indexOf(Constants.ROLE_OWNER), entity);
					return;
				} else if (entity.roles && entity.roles.length > 0) {
					// console.log("jhgf shfg: ", entity)
					log.info('subscribe ' + user.id + ' to ' + entity.item);
					subscribe({
						params: user.params || {},
						topic: entity.type === Constants.TYPE_ROOMREL ? 'room-' + entity.item :
						'thread-' + entity.item
					});
				}
			});
		}
	}
	next();
}

// console.log("Constants.APP_PRIORITIES.GCM", Constants.APP_PRIORITIES.GCM);
bus.on('change', handleSubscription, Constants.APP_PRIORITIES.GCM);
