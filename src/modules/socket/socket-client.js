/* @flow */

import uuid from 'node-uuid';
import store from '../store/store';
import { bus, config } from '../../core-client';
import packer from '../../lib/packer';
import { createConnection } from '../../lib/PersistentSocket';
import BuildConfig from '../../ui/modules/BuildConfig';

type Frame = {
	type: string;
	message: any;
	id?: string;
}

const {
	protocol,
	host,
} = config.server;

const version = 'v1';
const app_version_name = BuildConfig.VERSION_NAME;
const app_version_code = BuildConfig.VERSION_CODE;

const client = createConnection((protocol === 'https:' ? 'wss:' : 'ws:') + '//' + host);
const pendingCallbacks = {};

function handleMessage(frame) {
	frame.message.source = 'server';
	if (frame.message.id && pendingCallbacks[frame.message.id]) {
		pendingCallbacks[frame.message.id].options.response = frame.message;
		pendingCallbacks[frame.message.id].next();
	} else {
		bus.emit(frame.type, frame.message);
	}
}

function sendMessage(data) {
	const payload = {
		version,
		app_version_name,
		app_version_code,
		...data,
	};
	const message = packer.encode(payload);
	store.dispatch({
		type: 'SOCKET_SEND',
		payload,
	});
	try {
		client.send(message);
	} catch (e) {
		// ignore
	}
}

client.on('open', () => store.dispatch({ type: 'SOCKET_ONLINE' }));
client.on('close', () => store.dispatch({ type: 'SOCKET_OFFLINE' }));

client.on('message', (data: string) => {
	const payload: Frame = packer.decode(data);
	store.dispatch({
		type: 'SOCKET_RECEIVE',
		payload,
	});
	handleMessage(payload);
});

const props = [ 'queries', 'entities', 'auth', 'events' ];

bus.on('postchange', changes => {
	if (changes.source === 'server') return;

	const frame = {};

	for (let i = 0, l = props.length; i < l; i++) {
		const prop = props[i];

		if (changes[prop]) {
			frame[prop] = changes[prop];
		}
	}

	if (Object.keys(frame).length) {
		frame.id = uuid.v4();
		sendMessage({
			type: 'change',
			message: frame,
			id: uuid.v4(),
		});
	}
});

bus.on('signout', () => {
	client.reconnect();
	store.dispatch({ type: 'SOCKET_RECONNECT' });
});

bus.on('socket/get', (options, next) => {
	const id = uuid.v4();
	const frame: Frame = {
		type: options.type,
		message: {
			id,
			...options.data
		}
	};
	pendingCallbacks[id] = {
		next,
		options,
	};
	sendMessage(frame);
}, 1);
