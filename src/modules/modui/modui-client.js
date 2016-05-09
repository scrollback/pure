import React from 'react';
import ReactDOM from 'react-dom';
import RootComponent from './RootComponent';
import config from './config';

const eio = require('engine.io-client'); // eslint-disable-line import/no-commonjs

let todos = this.props.todo;

// if (localStorage && localStorage.todo) {
// 	try {
// 		todo = JSON.parse(localStorage.todo);
// 		console.log('Got todo:', todo.length);
// 		if (todo[0] !== 'separator') todo.unshift('separator');
// 	} catch (e) {
// 		// ignore
// 	}
// }

const client = new eio.Socket({ host: 'wss://' + config.server.host, path: config.server.path + '/engine.io' });

function rerender() {
	ReactDOM.render(<RootComponent />, document.getElementById('root'));
}

client.on('message', (message) => { // eslint-disable-line
	console.log('--->', message); // eslint-disable-line
	const data = JSON.parse(message);
	todos.unshift(data);
	todos = todos.slice(0, 1000);
	localStorage.todos = JSON.stringify(todos);
	rerender();
});

rerender();
