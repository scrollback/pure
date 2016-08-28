/* @flow */

// engine.io needs the userAgent string to be present
if (!global.navigator.userAgent) {
	global.navigator.userAgent = 'React Native';
}

const eio = require('engine.io-client');  // eslint-disable-line import/no-commonjs

export type SocketEvent = 'open' | 'close' | 'message';
export type SocketConnection = {
	send: (data: string) => void;
	reconnect: () => void;
	on: (event: SocketEvent, listener: Function) => void;
	off: (event: SocketEvent, listener: Function) => void;
}

const poll = 'document' in window && 'createElement' in window.document; // Disable polling in non-web environments, e.g.- react-native

function createConnection(url: string): SocketConnection {
	const listeners = {
		open: [],
		close: [],
		message: [],
	};

	let	backOff = 1;
	let state: 'open' | 'closed' = 'closed';
	let queue = [];
	let client;

	function createClient() {
		client = new eio.Socket(url, {
			jsonp: poll,
			transports: poll ? [ 'polling', 'websocket' ] : [ 'websocket' ],
		});

		/* eslint-disable no-use-before-define */
		client.on('open', handleOpen);
		client.on('close', handleClose);
		client.on('message', handleMessage);
	}

	function handleOpen() {
		state = 'open';
		backOff = 1;
		listeners.open.forEach(listener => listener());
		queue.forEach(data => client.send(data));
		queue = [];
	}

	function handleClose() {
		state = 'closed';
		listeners.close.forEach(listener => listener());
		if (backOff < 256) {
			backOff *= 2;
		} else {
			backOff = 256;
		}
		setTimeout(createClient, backOff * 1000);
	}

	function handleMessage(data: string) {
		listeners.message.forEach(listener => listener(data));
	}

	setTimeout(createClient, 0);

	return {
		send: (data: string) => {
			if (state === 'closed') {
				queue.push(state);
			} else {
				client.send(data);
			}
		},
		reconnect: () => {
			if (client) {
				client.close();
			}
		},
		on: (event: SocketEvent, listener: Function) => {
			listeners[event].push(listener);
		},
		off: (event: SocketEvent, listener: Function) => {
			const index = listeners[event].indexOf(listener);
			listeners[event].splice(index, 1);
		},
	};
}

export { createConnection };
