/* @flow */
import jwt from 'jsonwebtoken';
import winston from 'winston';
import { bus, config } from '../../core-server';
import { APP_PRIORITIES } from '../../lib/Constants';

// sign with default (HMAC SHA256)
const TOKEN_VALIDITY = 604800; // default seven days.
const ISSUER = config.host;
const AUDIENCE = config.host;
const KEY = config.session.private_key;

function getIDFromSession(session) {
	return new Promise((resolve, reject) => {
		jwt.verify(session, KEY, { aud: AUDIENCE }, (err, decoded) => {
			if (err) {
				reject(err);
			} else {
				resolve(decoded.sub);
			}
		});
	});
}

function generateSession(sub) {
	return new Promise((resolve) => {
		jwt.sign({
			iss: ISSUER, sub, aud: AUDIENCE,
			iat: Math.floor((new Date()).getTime() / 1000),
			exp: Math.floor((new Date()).getTime() / 1000) + TOKEN_VALIDITY
		}, KEY, {
			algorithm: 'HS256',
			type: 'JWS'
		}, (session) => {
			resolve(session);
		});
	});
}

function sessionHandler(changes, n) {
	const signin = {};

	function next(e) {
		winston.info('session callback', e);
		if (e) {
			(changes.response = changes.response || {}).state = {
				signin: {
					error: e
				}
			};

			n(changes);
		} else {
			n();
		}
	}
	winston.info('setstate: session module listener 1');

	if (changes.auth && changes.auth.session) {
		getIDFromSession(changes.auth.session)
		.then((sub) => {
			winston.debug('signing in as ', sub);
			changes.auth.user = sub;
			changes.auth.signin = signin;
			signin.id = sub;
			signin.params = {};
			next();
		})
		.catch(next);
	} else {
		next();
	}
}

bus.on('change', sessionHandler, APP_PRIORITIES.AUTHENTICATION_SESSION);
bus.on('change', (changes, next) => {
	if (changes.response && changes.response.state && changes.response.state.user) {
		generateSession(changes.response.state.user).then((session) => {
			changes.response.state.session = session;
			next();
		});
	} else {
		next();
	}

	return null;
}, APP_PRIORITIES.AUTHENTICATION_SESSION_2);

winston.info('Session module ready.');
