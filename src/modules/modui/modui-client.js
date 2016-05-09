import React from 'react';
import ReactDOM from 'react-dom';
import TodoList from './TodoList';
import config from './config';

const eio = require('engine.io-client'); // eslint-disable-line import/no-commonjs

let todos = [];

if (localStorage && localStorage.todos) {
	try {
		todos = JSON.parse(localStorage.todos);
		console.log('Got todos:', todos.length);
		if (todos[0] !== 'separator') todos.unshift('separator');
	} catch (e) {
		// ignore
	}
}

const client = new eio.Socket({ host: 'wss://' + config.server.host, path: config.server.path + '/engine.io' });

function rerender() {
	ReactDOM.render(<TodoList todos={todos}/>, document.getElementById('root'));
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
