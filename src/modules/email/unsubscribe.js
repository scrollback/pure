import fs from 'fs';
import jwt from 'jsonwebtoken';
import log from 'winston';
import handlebars from 'handlebars';
import promisify from '../../lib/promisify';
import { bus, config, cache } from '../../core-server';
import route from 'koa-route';
const template = handlebars.compile(fs.readFileSync(__dirname + '/../../../templates/unsubscribe.hbs', 'utf8').toString());

const queryAsync = promisify(cache.query.bind(cache));

function *handleRequest() {
	let decoded;

	// extract the Email address from the request
	try {
		decoded = jwt.verify(this.request.query.email, config.email.secret);

	} catch (e) {
		log.i('Invalid unsubscribe JWT: ' + this.request.query.email);
		this.body = template({
			message: 'You were not unsubscribed because the unsubscribe link has expired. Please click the link on a newer email.'
		});
	}

	try {
		// search the database and find the user with this email
		const results = yield queryAsync({
			type: 'user',
			filter: { identities_cts: [ 'mailto:' + decoded.email ] },
			order: 'createTime'
		}, [ -Infinity, Infinity ]);

		if (!results.arr || !results.arr.length) {
			this.body = template({
				message: 'User does not exist.'
			});
			return;
		}

		// Received the user from the database! Changing the settings...
		const user = results.arr[0];

		user.params.email = user.params.email || {};
		user.params.email.frequency = 'never';
		user.params.email.notifications = false;

		yield new Promise((resolve, reject) => {
			// Saving the saved settings back into the database.
			bus.emit('change', {
				entities: {
					[user.id]: user
				}
			}, (e) => {
				if (e) {
					reject(e);
				} else {
					resolve();
				}
			});
		});

		this.body =	template({
			message: 'You have been unsubscribed.',
			message2: 'You can again subscribe from "My account" page.'
		});
	} catch (err) {
		this.body = template({
			message: 'Sorry, an internal server error prevented you from being unsubscribed.'
		});
	}
}

bus.on('http/init', app => {
	app.use(route.get('/r/unsubscribe', handleRequest));
});
