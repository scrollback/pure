/* eslint no-use-before-define: 0 */
/* @flow */
import Logger from '../../lib/logger';
import { config, bus, cache } from '../../core-server';
import { ROLE_FOLLOWER } from '../../lib/Constants';
import { subscribe, getIIDInfo } from './subscribeTopics';

// import util from 'util';
let client;
const sessionAndtokens = {}, log = new Logger(__filename);

export function getTokenFromSession(session: ?string) {
	if (!session) {
		log.info('no session found');
		return { error: 'NO_TOKEN_AND_SESSION' };
	}
	return {
		token: sessionAndtokens[session].token,
		sessionId: session,
	};
}

function saveTokenAndSession(token, sessionId) {
	log.debug('token and session saved');
	sessionAndtokens[sessionId] = { token };
}

function sendDownstreamMessage (upStanza, type, cb) {
	if (!upStanza) {
		log.info('no upstanza to send');
		return;
	}
	const stnza =
	`<message>
		<gcm xmlns="google:mobile:data">
			{
					"to":"${upStanza.from}",
					"message_id":"${upStanza.message_id}"
					"message_type": "${type}"
			}
		</gcm>
	</message>`;

	log.info('Sending ' + type + ' message: ', stnza);
	client.send(stnza);
	if (cb) cb();
}
export function updateUser(u: Object, cb?: Function) {
	if (!u.data.sessionId && !u.data.token) {
		// console.log('no data token and session found to update user');
		return;
	}
	console.log('auth user: ', u.data.sessionId);
	bus.emit('change', {
		auth: {
			session: u.data.sessionId,
		},
	}, (err, changes) => {
		if (err) {
			log.error('error on auth user: ', err, u.data.sessionId);
			saveTokenAndSession(u.data.token, u.data.sessionId);
			sendDownstreamMessage(u, 'ACK');
			if (cb) cb(err);
		} else {
			log.info('update user with token');
			const user = changes.response.entities[changes.response.state.user];

			if (user && user.params && user.params.gcm) {
				const oldGcm = user.params.gcm;
				if (oldGcm[u.data.uuid] === u.data.token) {
					log.info('Same gcm token. return');
					sendDownstreamMessage(u, 'ACK');
					return;
				} else {
					// subscribe new token to all topics that previous token is subscribed to.
					getIIDInfo(oldGcm[u.data.uuid], (error, result, body) => {
						let parsedBody;
						try {
							parsedBody = JSON.parse(body);
						} catch(er) {
							log.error(er);
							parsedBody = null;
						}

						if (error || !parsedBody || !parsedBody.rel) {
							log.error(error);
							subscribeAll(user.id);
							return;
						}
						if (body && parsedBody && parsedBody.rel) {
							Object.keys(JSON.parse(body).rel.topics).forEach(topic => {
								log.info('subscribing to new topic: ', topic);
								subscribe({
									params: {
										gcm: { new: u.data.token },
									},
									topic,
								});
							});
						} else {
							log.debug('body: ', body);
							log.info('Not found previous subscribed topics.');
						}
					});
				}
			}

			(user.params.gcm = user.params.gcm || {})[u.data.uuid] = u.data.token;
			bus.emit('change', {
				entities: {
					[user.id]: user,
				},
			}, (e) => {
				if (e) {
					log.debug('error on saving token: ', e);
					if (cb) cb(e);
				} else {
					subscribeAll(user.id);
					sendDownstreamMessage(u, 'ACK', () => {
						log.info('subscribing user: ', user.id, 'for mention');
						subscribe({
							params: user.params || {},
							topic: 'user-' + user.id,
						});
						log.info('subscribe to global topic');
						subscribe({
							params: user.params || {},
							topic: 'global',
						});
						if (cb) cb(null);
					});
				}
			});
		}
	});
}

function handleStanza(stanza) {
	log.info('stanza received');
	const st = stanza.toJSON();
	let x;

	log.info('stanza: ', JSON.stringify(st));

	if (st.children && st.children[0] && st.children[0].children) {
		x = JSON.parse(st.children[0].children[0]);
	}
	// console.log("x: ", x)
	if (x && x.category === config.gcm.packageName) {
		log.info('Handle upstream message: ', x);
		updateUser(x);
	}
}

export default function(c: Object) {
	client = c;
	client.on('stanza', handleStanza);
}

/* Remove this function later: */
function subscribeAll(id) {
	log.info('subscribe to all: ', id);
	cache.getEntity(id, (err, user) => {
		if (err) return;
		subscribe({
			params: user.params,
			topic: 'user-' + id,
		});
		cache.query({
			type: 'roomrel',
			filter: { user: user.id, roles_cts: [ ROLE_FOLLOWER ] },
			order: 'createTime',
		}, [ -Infinity, Infinity ], (error, rels) => {
			if (err) { return; }
			for (const i of rels) {
				subscribe({
					params: user.params,
					topic: 'room-' + i.item,
				});
			}
		});
	});
}
