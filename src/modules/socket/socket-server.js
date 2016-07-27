import engine from 'engine.io';
import winston from 'winston';
import * as core from '../../core-server';
import uid from '../../lib/uid-server';
import notify from '../../lib/dispatch';
import packer from '../../lib/packer';
import * as Constants from '../../lib/Constants';

const sockets = {}, bus = core.bus;

function sendError(socket, code, reason, event) {
	socket.send(packer.encode({
		type: 'error',
		message: {
			code,
			reason,
			event,
		},
	}));
}

function handleActions(type, socket, message, resourceId, err) {
	message.response = message.response || {};
	message.response.id = message.id;
	if (err) {
		const errorToSend = {
				type: 'error',
				message: message.response,
			}, encoded = packer.encode(errorToSend);

		socket.send(encoded);
	} else {
		const toSend = {
				type,
				message: message.response,
			}, encoded = packer.encode(toSend);
		socket.send(encoded);
	}
}
function handleChange(socket, message, resourceId, err) {
	if (err) {
		if (message.response) {
			const errorToSend = {
					type: 'error',
					message: message.response,
				}, encoded = packer.encode(errorToSend);

			winston.info('Sending Error:', errorToSend);
			socket.send(encoded);
		} else {
			sendError(
				socket, err.code || 'ERR_UNKNOWN', err.message, message
			);
		}
		return;
	}

	if (message.response) {
		if (message.changedQueries) {
			for (const key in message.changedQueries) {
				const oldKey = message.changedQueries[key];
				if (message.response.indexes) {
					message.response.indexes[oldKey] = message.response.indexes[key];
					delete message.response.indexes[key];
				}

				if (message.response.knowledge) {
					message.response.knowledge[oldKey] = message.response.knowledge[key];
					delete message.response.knowledge[key];
				}
			}
		}
		if (message.auth && message.auth.user) {
			bus.emit('presence/online', {
				resource: resourceId,
				user: message.auth.user,
			});
		}
		const toSend = {
				type: 'change',
				message: message.response,
			}, encoded = packer.encode(toSend);

		winston.debug('To send:', JSON.stringify(toSend));
		winston.debug('Encoded string: ', encoded);
		socket.send(encoded);
	}
}

bus.on('http/init', app => {
	const socketServer = engine.attach(app.httpServer);

	socketServer.on('connection', socket => {
		const resourceId = uid(16);

		sockets[resourceId] = socket;
		socket.on('close', () => {
			bus.emit('presence/offline', {
				resource: resourceId,
			});
			delete sockets[resourceId];
		});

		socket.on('message', m => {
			let frame;

			winston.info('new event: ', m);
			try {
				frame = packer.decode(m);
			} catch (e) {
				sendError(socket, 0, 'ERR_EVT_PARSE', e.message);
				return;
			}

			const message = frame.message;
			message.version = frame.version;
			if (typeof message !== 'object') {
				sendError(socket, 'ERR_UNKNOWN', 'invalid');
				return;
			}

			winston.info(`SOCKET-UP: Message Received: ${resourceId}: `, JSON.stringify(message));

			(message.auth = message.auth || {}).resource = resourceId;
			if (frame.type === 'change' && message.entities) {
				for (const id in message.entities) {
					if (message.entities[id] && typeof message.entities[id].presence === 'number') {
						message.entities[id].resources = message.entities[id].resources || {};
						message.entities[id].resources[resourceId] = message.entities[id].presence;

						if (message.entities[id].type !== Constants.TYPE_USER) message.entities[id].presenceTime = Date.now();
					}
				}
			}

			message.source = 'socket';

			if (frame.type === 'change') {
				bus.emit('change', message, handleChange.bind(null, socket, message, resourceId));
			} else if (frame.type) {
				bus.emit(frame.type, message, handleActions.bind(null, frame.type, socket, message, resourceId));
			}
		});
	});
});

bus.on('postchange', changes => {
	notify(changes, core.cache, core.config).on('data', (change, res) => {
		if (!res || !res.resource) return;
		if (!sockets[res.resource]) return;

		if (res.presence > Constants.PRESENCE_NONE) {
			const toDispatch = {
					type: 'change',
					message: change,
					info: 'sent by dispatch',
				}, encoded = packer.encode(toDispatch);

			winston.info('SOCKET-DN: Dispatching: ' + res.resource, JSON.stringify(toDispatch));
			winston.debug('Encoded string: ', encoded);
			sockets[res.resource].send(encoded);
		}
	});
});
