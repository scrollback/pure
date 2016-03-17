import engine from 'engine.io';
import winston from 'winston';
import * as core from '../../core-server';
import uid from '../../lib/uid-server';
import notify from './../../lib/dispatch';
import packer from './../../lib/packer';
import * as Constants from './../../lib/Constants';
// import util from 'util';
const sockets = {}, bus = core.bus;

function sendError(socket, code, reason, event) {
	socket.send(packer.encode({
		type: 'error',
		message: {
			code,
			reason,
			event
		}
	}));
}

bus.on('http/init', app => {
	const socketServer = engine.attach(app.httpServer);

	socketServer.on('connection', socket => {
		const resourceId = uid(16);

		sockets[resourceId] = socket;
		socket.on('close', () => {
			bus.emit('presence/offline', {
				resource: resourceId
			});
			delete sockets[resourceId];
		});

		socket.on('message', m => {
			let message;

			winston.info('new event: ', m);
			try {
				message = packer.decode(m);
			} catch (e) {
				sendError(socket, 0, 'ERR_EVT_PARSE', e.message);
				return;
			}

			if (typeof message !== 'object') {
				sendError(socket, 'ERR_UNKNOWN', 'invalid');
				return;
			}

			winston.debug(`Message Received: ${resourceId}: `, JSON.stringify(message));
			message.id = uid(16);
			(message.auth = message.auth || {}).resource = resourceId;

			if (message.entities) {
				for (const id in message.entities) {
					if (typeof message.entities[id].presence === 'number') {
						message.entities[id].resources = message.entities[id].resources || {};
						message.entities[id].resources[resourceId] = message.entities[id].presence;

						if (message.entities[id].type !== Constants.TYPE_USER) message.entities[id].presenceTime = Date.now();
					}
				}
			}
			function handleSetState(err) {
				if (err) {
					if (message.response) {

						const errorToSend = {
								type: 'error',
								message: message.response
							}, encoded = packer.encode(errorToSend);

						winston.debug('Sending Error:', errorToSend);
						socket.send(encoded);
					} else {
						sendError(
							socket, err.code || 'ERR_UNKNOWN', err.message, message
						);
					}
					return;
				}

				if (message.response) {
					if (message.auth && message.auth.user) {
						bus.emit('presence/online', {
							resource: resourceId,
							user: message.auth.user
						});
					}
					const toSend = {
							type: 'change',
							message: message.response
						}, encoded = packer.encode(toSend);

					winston.debug('To send:', JSON.stringify(toSend));
					winston.debug('Encoded string: ', encoded);
					socket.send(encoded);
				}
			}

			message.source = 'socket';
			bus.emit('change', message, handleSetState);
		});
	});
});

bus.on('postchange', changes => {
	notify(changes, core.config).on('data', (change, rel) => {
		if (!rel || !rel.resources || typeof rel.resources !== 'object') return;
		Object.keys(rel.resources).forEach(e => {
			if (!sockets[e]) return;

			if (rel.resources[e] > Constants.PRESENCE_NONE) {
				const toDispatch = {
						type: 'change',
						message: change,
						info: 'sent by dispatch'
					}, encoded = packer.encode(toDispatch);

				winston.debug('Dispatching:' + e, JSON.stringify(toDispatch));
				winston.debug('Encoded string: ', encoded);
				sockets[e].send(encoded);
			}
		});
	});
});
