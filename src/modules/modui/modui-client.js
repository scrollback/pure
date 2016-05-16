import React from 'react';
import ReactDOM from 'react-dom';
import RootComponent from './RootComponent';
import config from './config';

const eio = require('engine.io-client'); // eslint-disable-line import/no-commonjs

// const client = new eio.Socket({ host: 'wss://' + config.server.host, path: config.server.path + '/engine.io' });
const client = new eio.Socket({ host: 'wss://' + config.server.host, path: config.server.path, port: 3030 });


let todo = [], store;

if (localStorage && localStorage.todo) {
	try {
		todo = JSON.parse(localStorage.todo);
	} catch (e) {
		// ignore
	}
}

function parseMessage(data) {
	if (typeof data === 'string') {
		try {
			data = JSON.parse(data);
		} catch (e) {
			data = {};
		}
	} else if (typeof data !== 'object' || data === null) {
		data = {};
	}

	return data;
}

function verifyMessageOrigin(event) {
	const origin = store.get('context', 'origin');

	return (
		event.origin === location.origin ||
		origin.verified && event.origin === origin.protocol + '//' + origin.host
	);
}

function onMessage(e) {
	const data = parseMessage(e.data);

	if (data.type === 'domain-response' || !verifyMessageOrigin(e)) { return; }

	switch (data.type) {
	case 'auth':
		client.send({
			type: 'change',
			message: {
				auth: {
					facebook: {
						code: data.code
					}
				}
			}
		});
		break;
	}
}

window.addEventListener('message', onMessage);

function rerender() {
	ReactDOM.render(<RootComponent todo={todo}/>, document.getElementById('root'));
}

client.on('message', (message) => { // eslint-disable-line
	console.log('--->', message); // eslint-disable-line
	const data = JSON.parse(message);
	todo.unshift(data);
	todo = todo.slice(0, 1000);
	todo = JSON.stringify(todo);
	rerender();
});

rerender();
