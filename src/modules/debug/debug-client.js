import config from './debug-client-config';

const eio = require('engine.io-client'); // eslint-disable-line import/no-commonjs
console.log("config: ", 'wss://' + config.server.host, config.server.path + '/engine.io');
const client = new eio.Socket({ host: 'wss://' + config.server.host, path: config.server.path + '/engine.io', port: config.server.port });

client.on('message', (message) => {
	const data = JSON.parse(message);
	console.log(data); //eslint-disable-line
});

global.socket = client;
