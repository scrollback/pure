/* @flow */
/*
	resources:
	https://developers.facebook.com/tools/explorer/
 */

import * as Constants from '../../lib/Constants';
import EnhancedError from '../../lib/EnhancedError';
import route from 'koa-route';
import { bus, config } from '../../core-server';
import winston from 'winston';
import request from 'request';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import encodeURITemplate from '../../lib/encodeURITemplate';

const redirectURL = `https://${config.host}${config.facebook.redirect_path}`;
const SCRIPT_REDIRECT = encodeURITemplate `location.href='https://www.facebook.com/dialog/oauth?\
client_id=${config.facebook.client_id}&\
redirect_uri=${redirectURL}&\
response_type=code&scope=email`;
const SCRIPT_MESSAGE = `
	window.opener.postMessage({
		type: "auth",
		provider: "facebook",
		code: location.search.substring(6)
	}, "*");

	window.close();
`;

function getTokenFromCode(code, secret, clientID) {
	return new Promise((resolve, reject) => {
		const url = encodeURITemplate `\
		https://graph.facebook.com/oauth/access_token?client_id=${clientID}\
		&redirect_uri=${redirectURL}\
		&client_secret=${secret}\
		$code=${code}\
		`;

		request(url, (err, res, body) => {
			const queries = body.split('&');
			let i, l, token;

			if (err) {
				const error = new EnhancedError(err.message, err.message);

				winston.error(err);
				reject(error);
				return;
			}

			for (i = 0, l = queries.length; i < l; i++) {
				if (queries[i].indexOf('access_token') >= 0) {
					token = queries[i].replace('access_token=', '');
					break;
				}
			}

			resolve(token);
		});
	});
}

function verifyToken(token, appId) {
	return new Promise((resolve, reject) => {
		request(encodeURITemplate `https://graph.facebook.com/app/?access_token=${token}`,
		(err, res, body) => {
			if (err || !res) {
				reject(err);
				return;
			}

			winston.debug('verify response', body);
			const response = JSON.parse(body);

			winston.debug('verify appId', response.id, appId);
			if (response.error) {
				reject(new Error(response.error.message));
				return;
			}

			if (response.id === appId) resolve(token);
			else reject(new EnhancedError(Constants.ERRORS.AUDIENCE_MISMATCH_FACEBOOK, 'AUDIENCE_MISMATCH_FACEBOOK'));
		});
	});
}

function getDataFromToken(token) {
	const signin = {};

	return new Promise((resolve, reject) => {
		request(encodeURITemplate `https://graph.facebook.com/me/?fields=email,name,picture,timezone,verified&access_token=${token}`, (err, res, body) => {
			try {
				if (err) throw err;
				const user = JSON.parse(body);

				if (user.error) {
					throw (new EnhancedError(user.error || Constants.ERRORS.ERR_FACEBOOK_SIGNIN_FAILED, user.error || 'ERR_FACEBOOK_SIGNIN_FAILED'));
				}
	//			response.signin.pictures.push('https://gravatar.com/avatar/' + crypto.createHash('md5').update(user.email).digest('hex') + '/?d=retro');

				(signin.identities = []).push('facebook:' + user.id);

				if (user.email) signin.identities.push('mailto:' + user.email);

				signin.params = {
					facebook: {
						facebookID: user.id,
						accessToken: token,
						name: user.name,
						timezone: user.timezone,
						verified: user.verified,
						picture: encodeURITemplate `https://graph.facebook.com/${user.id}/picture?type=square&height=192&width=192`
					}
				};
				signin.timezone = user.timezone * 60;
				resolve(signin);
			} catch (e) {
				reject(e);
			}
		});
	});
}

function fbAuth(changes, n) {
	winston.debug('setstate: facebook module');

	function next(e) {
		if (e) {
			(changes.response = changes.response || {}).state = changes.auth;
			changes.response.state.facebook.error = e;
			n(changes);
		} else {
			n();
		}
	}

	if (!changes.auth || !changes.auth.facebook) {
		return next();
	}

	/* TODO: how do we handle auth from already logged in user?*/
	const key = changes.auth.facebook.code || changes.auth.facebook.accessToken;

	if (!key) {
		return next(new EnhancedError(Constants.ERRORS.INVALID_FACEBOOK_KEY, 'INVALID_FACEBOOK_KEY'));
	}

	const promise = ((changes.auth.facebook.code) ? getTokenFromCode(key, config.facebook.client_secret, config.facebook.client_id, config.host) : verifyToken(key, config.facebook.client_id));

	promise.then((token) => {
		if (!token) {
			return next(new EnhancedError(Constants.ERRORS.INVALID_FACEBOOK_TOKEN, 'INVALID_FB_TOKEN'));
		}

		getDataFromToken(token).then((response) => {
			if (!response) {
				return next(new EnhancedError(Constants.ERRORS.FACEBOOK_RESPONSE_PARSE_ERROR, 'FACEBOOK_RESPONSE_PARSE_ERROR'));
			}
			changes.auth.signin = response;
			winston.debug('response', changes);
			return next();
		}).catch((err) => {
			return next(new EnhancedError(Constants.ERRORS[err.message] || err.message, err.message));
		});

		return null;
	}).catch((err) => {
		// TODO: findout what other errors could possibily  happen
		return next(new EnhancedError(Constants.ERRORS[err.message] || err.message, err.message));
	});
	return null;
}

bus.on('change', fbAuth, Constants.APP_PRIORITIES.AUTHENTICATION_FACEBOOK);

const scriptTemplate = handlebars.compile(fs.readFileSync(path.join(__dirname, '../../../templates/script.hbs'), 'utf8').toString());

bus.on('http/init', app => {
	app.use(route.get(config.facebook.login_url, function *() {
		this.body = scriptTemplate({
			title: 'Logging in with Facebook',
			script: SCRIPT_REDIRECT
		});
	}));

	app.use(route.get(config.facebook.redirect_path, function *() {
		this.body = scriptTemplate({
			title: 'Logging in with Facebook',
			script: SCRIPT_MESSAGE
		});
	}));
});

winston.info('Facebook module ready.');
