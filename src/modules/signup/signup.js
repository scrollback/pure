/* @flow */

import EnhancedError from '../../lib/EnhancedError';
import { bus, cache, config } from '../../core-server';
import { TYPE_USER, APP_PRIORITIES, ERRORS } from '../../lib/Constants';
import jwt from 'jsonwebtoken';
import merge from 'lodash/merge';
import winston from 'winston';
// sign with default (HMAC SHA256)

const TOKEN_VALIDITY = 604800, // seven days
	ISSUER = config.host,
	AUDIENCE = config.host,
	KEY = config.session.private_key;

function getIdentitiesFromJWT(token) {
	return new Promise((resolve, reject) => {
		jwt.verify(token, KEY, { aud: AUDIENCE }, (err, decoded) => {
			if (err) {
				reject(err);
			} else {
				resolve(decoded.sub);
			}
		});
	});
}

function generateSignedIdentities(identities) {
	return new Promise((resolve) => {
		jwt.sign({
			iss: ISSUER, sub: identities, aud: AUDIENCE,
			iat: Math.floor((new Date()).getTime() / 1000),
			exp: Math.floor((new Date()).getTime() / 1000) + TOKEN_VALIDITY, // seven days
		}, KEY, {
			algorithm: 'HS256',
			type: 'JWS',
		}, (session) => {
			resolve(session);
		});
	});
}

function signuphandler(changes, n) {
	let signup = {};

	winston.info('Change reached signup module');
	function next(e) {
		if (e) {
			(changes.response = changes.response || {}).state = changes.auth;
			changes.response.state.signup.error = e;
			n(changes);
		} else {
			n();
		}
	}
	if (changes.auth && changes.auth.signup) {
		getIdentitiesFromJWT(changes.auth.signup.signedIdentities)
		.then((identities) => {
			changes.auth.signup.identities = identities;
			delete changes.auth.signup.signedIdentities;

			cache.getEntity(changes.auth.signup.id, (err, entity) => {
				if (err && next) return next(err);
				if (entity && next) return next(new EnhancedError(ERRORS.ERR_USER_NAME_TAKEN, 'ERR_USER_NAME_TAKEN'));
				changes.auth.user = changes.auth.signup.id;

				changes.response = changes.response || {};
				changes.response.state = changes.response.state || {};
				changes.response.state.user = changes.auth.signup.id;
				changes.response.state.signup = null;
				const user = (changes.entities = changes.entities || {})[changes.auth.signup.id] = changes.auth.signup;

				user.type = TYPE_USER;
				user.createTime = Date.now();
				user.resources = changes.auth.signup.resources || {};
				user.presence = changes.auth.signup.resources[changes.auth.resource] = 1;
				user.meta = changes.auth.signup.meta || {};
				user.meta.picture = changes.auth.signup.params[Object.keys(changes.auth.signup.params)[0]].picture;

				// REVIEW: check if this is fine or should the changes.entities itself be fired and sent to the client?
				(changes.response.entities = changes.response.entities || {})[user.id] = changes.auth.signup;

				winston.info('okay its a sign up.', changes.entities);
				return next();
			});
		})
		.catch(next);
	} else if (changes.auth && changes.auth.signin) {
		signup = merge(changes.auth.signin, signup);
		changes.response = changes.response || {};
		changes.response.state = changes.response.state || {};
		changes.response.state.signup = signup;

		generateSignedIdentities(signup.identities).then((session) => {
			signup.signedIdentities = session;
			next();
		});
	} else {
		next();
	}
}

bus.on('change', signuphandler, APP_PRIORITIES.AUTHENTICATION_SIGNUP);
winston.info('Signup module ready.');
