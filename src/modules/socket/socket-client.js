/* @flow */

import uuid from 'node-uuid';
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

	bus.emit('change', {
		state: { connectionStatus: 'offline', backOff },
	});

	setTimeout(connect, backOff * 1000);
}

function onMessage(message) {
	const frame = packer.decode(message);

	console.log('-->', frame);

	frame.message.source = 'server';
	if (frame.type === 'contacts' || frame.type === 's3/getPolicy') {
		if (pendingCallbacks[frame.message.id]) {
			pendingCallbacks[frame.message.id].data.response = frame.message;
			pendingCallbacks[frame.message.id].next();
		}
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
		bus.emit('change', {
			state: { connectionStatus: 'online', backOff },
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

const props = [ 'queries', 'entities', 'auth' ];

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

bus.on('state:init', state => {
	state.connectionStatus = 'connecting';
	setTimeout(connect, 0);
});

bus.on('signout', () => {
	if (client) {
		client.close();
	}
	bus.emit('change', {
		state: {
			connectionStatus: 'connecting',
		},
	});
	connect();
});

bus.on('s3/getPolicy', (policy, next) => {
	const frame: Frame = {
		type: 's3/getPolicy',
		message: policy,
	};

	policy.id = uuid.v4();
	pendingCallbacks[policy.id] = {
		data: policy,
		next,
	};

	send(frame);
}, 1);
