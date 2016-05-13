import { cache as c } from '../../core-server'; // eslint-disable-line
import engine from 'engine.io';
import http from 'http';
import fs from 'fs';
import path from 'path';
import config from './debug-server-config';

const httpServer = http.createServer((req, res) => {
	switch (req.url) {
	case '/':
		fs.createReadStream(path.join(__dirname, '../../../static/dist/debug.html')).pipe(res);
		break;
	default:
		res.writeHead(404);
		res.end('Not found ' + req.url);
	}
}).listen(config.port);

const sockServer = engine.attach(httpServer);
const sockets = [];

sockServer.on('connection', (socket) => {
	sockets.push(socket);
	socket.on('message', m => {
		const cache = c; // eslint-disable-line
		try {
			socket.send(eval('(JSON.stringify(' + m + '))')); // eslint-disable-line no-eval
		} catch (e) {
			socket.send(JSON.stringify({
				error: e.message
			}));
		}
	});
	socket.on('close', () => {
		const index = sockets.indexOf(socket);
		if (index >= 0) { sockets.splice(index, 1); }
	});
});
