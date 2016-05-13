import React from 'react';
import ReactDOM from 'react-dom';
import RootComponent from './RootComponent';
import config from './config';

const eio = require('engine.io-client'); // eslint-disable-line import/no-commonjs

let todo = [];

if (localStorage && localStorage.todo) {
	try {
		todo = JSON.parse(localStorage.todo);
	} catch (e) {
		// ignore
	}
}

const client = new eio.Socket({ host: 'wss://' + config.server.host, path: config.server.path + '/engine.io' });
// const client = new eio.Socket({ host: 'wss://' + config.server.host, path: config.server.path, port: 3030 });

function rerender() {
	ReactDOM.render(<RootComponent todo={todo}/>, document.getElementById('root'));
}

client.on('message', (message) => { // eslint-disable-line
	console.log('--->', message); // eslint-disable-line
	const data = JSON.parse(message);
	todo.unshift(data);
	todo = todo.slice(0, 1000);
	localStorage.todo = JSON.stringify(todo);
	rerender();
});

rerender();
