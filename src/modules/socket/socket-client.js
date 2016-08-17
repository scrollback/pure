/* @flow */

import uuid from 'node-uuid';
import store from '../store/store';
import { bus, config } from '../../core-client';
import packer from '../../lib/packer';
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
const poll = 'document' in window && 'createElement' in window.document; // Disable polling in non-web environments, e.g.- react-native

// engine.io needs the userAgent string to be present
if (!global.navigator.userAgent) {
	global.navigator.userAgent = 'React Native';
}
const eio = require('engine.io-client'); // eslint-disable-line import/no-commonjs

let	backOff = 1, client, pendingCallbacks = {};

function disconnected() {

	/* eslint-disable no-use-before-define */
	pendingCallbacks = {};

	if (backOff < 256) {
		backOff *= 2;
	} else {
		backOff = 256;
	}

	store.dispatch({
		type: 'SET_CONNECTION_STATUS',
		payload: 'offline',
	});

	setTimeout(connect, backOff * 1000);
}

function onMessage(message) {
	const frame = packer.decode(message);

	console.log('-->', frame);

	frame.message.source = 'server';

	if (frame.message.id && pendingCallbacks[frame.message.id]) {
		pendingCallbacks[frame.message.id].options.response = frame.message;
		pendingCallbacks[frame.message.id].next();
	} else {
		bus.emit(frame.type, frame.message);
	}
}

function connect() {
	client = new eio.Socket((protocol === 'https:' ? 'wss:' : 'ws:') + '//' + host, {
		jsonp: poll,
		transports: poll ? [ 'polling', 'websocket' ] : [ 'websocket' ],
	});

	client.on('close', disconnected);

	client.on('open', () => {
		backOff = 1;

		store.dispatch({
			type: 'SET_CONNECTION_STATUS',
			payload: 'online',
		});
	});

	client.on('message', onMessage);
}

function send(data) {
	client.send(packer.encode({
		version,
		app_version_name,
		app_version_code,
		...data,
	}));
}

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
		console.trace('<--', frame);
		frame.id = uuid.v4();
		send({
			type: 'change',
			message: frame,
			id: uuid.v4(),
		});
	}
});

bus.on('signout', () => {
	if (client) {
		client.close();
	}

	store.dispatch({
		type: 'SET_CONNECTION_STATUS',
		payload: 'connecting',
	});

	connect();
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

	send(frame);
}, 1);

setTimeout(connect, 0);
