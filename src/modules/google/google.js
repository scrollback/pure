/*
resources:
https://developers.google.com/identity/protocols/OAuth2UserAgent#validatetoken
https://developers.google.com/oauthplayground/

TODO: use switch to 2.4.
*/

import EnhancedError from '../../lib/EnhancedError';
import fs from 'fs';
import path from 'path';
import winston from 'winston';
import request from 'request';
import handlebars from 'handlebars';
import route from 'koa-route';
import queryString from 'querystring';
import { bus, config } from './../../core-server';
import encodeURITemplate from '../../lib/encodeURITemplate';
import * as Constants from '../../lib/Constants';

const redirectURL = `https://${config.host}${config.google.redirect_path}`;

const SCRIPT_REDIRECT = `\
location.href = 'https://accounts.google.com/o/oauth2/auth?\
scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile&\
client_id=${config.google.client_id}&\
redirect_uri=${redirectURL}&\
response_type=code&access_type=offline`;

const SCRIPT_MESSAGE = `
	var code = (location.search.substring(1).split("&").filter(function(seg) {
		return seg.indexOf("code=") === 0;
	})[0] || "").substr(5);

	window.opener.postMessage({
		type: "auth",
		provider: "google",
		code: code
	}, "*");

	window.close();
`;

// TODO: most of the code is copy paste from facebook module. see if u can avoid that when u get time.
function getTokenFromCode(code) {
	return new Promise((resolve, reject) => {
		request.post({
			uri: 'https://accounts.google.com/o/oauth2/token',
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			},
			body: queryString.stringify({
				code,
				redirect_uri: redirectURL,
				client_id: config.google.client_id,
				client_secret: config.google.client_secret,
				grant_type: 'authorization_code'
			})
		}, (err, res, t) => {

			if (err) {
				const error = new EnhancedError(err.message, err.message);

				winston.error(err);
				reject(error);
				return;
			}

			try {
				const tokenBody = JSON.parse(t), token = tokenBody.access_token;

				if (!token) throw new Error('INVALID_GOOGLE_CODE');
				resolve(token);
			} catch (e) {
				reject(e);
			}
		});
	});
}

function verifyToken(token, appId) {
	return new Promise((resolve, reject) => {
		request(encodeURITemplate `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`,
		(err, res, body) => {
			winston.error(err, body);
			if (err || !res) {
				reject(err);
				return;
			}

			const response = JSON.parse(body);

			if (response.error) {
				reject(new Error(response.error.message));
				return;
			}

			if (response.aud === appId) resolve(token);
			else reject(new EnhancedError(Constants.ERRORS.AUDIENCE_MISMATCH_GOOGLE, 'AUDIENCE_MISMATCH_GOOGLE'));
		});
	});
}

function getDataFromToken(token) {
	const signin = {};

	return new Promise((resolve, reject) => {
		request(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`, (err, res, body) => {
			try {
				if (err) throw (err);
				const user = JSON.parse(body);

				if (user.error) {
					throw (new EnhancedError(user.error || Constants.ERRORS.ERR_FACEBOOK_SIGNIN_FAILED, user.error || 'ERR_FACEBOOK_SIGNIN_FAILED'));
				} else if (!user.email) {
					throw (new Error(user.error || 'ERR_GOOGLE_SIGNIN_NO_EMAIL'));
				}
	//			response.signin.pictures.push('https://gravatar.com/avatar/' + crypto.createHash('md5').update(user.email).digest('hex') + '/?d=retro');

				(signin.identities = []).push('mailto:' + user.email);
				signin.params = {
					google: {
						idToken: token,
						verified: true,
						name: user.name,
						picture: user.picture
					}
				};
				resolve(signin);
			} catch (e) {
				reject(e);
			}
		});
	});
}

function googleAuth(changes, n) {
	winston.debug('setstate: facebook module');

	function next(e) {
		if (e) {
			(changes.response = changes.response || {}).state = changes.auth;
			changes.response.state.google.error = e;
			n(changes);
		} else {
			n();
		}
	}

	if (!changes.auth || !changes.auth.google) {
		return next();
	}

	/* TODO: how do we handle auth from already logged in user?*/
	const key = changes.auth.google.code || changes.auth.google.idToken;

	if (!key) {
		return next(new EnhancedError(Constants.ERRORS.INVALID_GOOGLE_KEY, 'INVALID_GOOGLE_KEY'));
	}

	winston.debug('Google Login Request', changes.auth.google);
	const promise = ((changes.auth.google.code) ? getTokenFromCode(key) : verifyToken(key, config.google.client_id));

	promise.then((token) => {
		winston.debug('T->D', token);
		if (!token) {
			return next(new EnhancedError(Constants.ERRORS.INVALID_GOOGLE_TOKEN, 'INVALID_GOOGLE_TOKEN'));
		}

		getDataFromToken(token).then((response) => {
			if (!response) {
				return next(new EnhancedError(Constants.ERRORS.GOOGLE_RESPONSE_PARSE_ERROR, 'GOOGLE_RESPONSE_PARSE_ERROR'));
			}
			winston.debug('response', changes);
			changes.auth.signin = response;
			return next();
		}).catch(error => next(error));

		return null;
	}).catch(error => next(error));
	return null;
}

bus.on('change', googleAuth, Constants.APP_PRIORITIES.AUTHENTICATION_GOOGLE);

const scriptTemplate = handlebars.compile(fs.readFileSync(path.join(__dirname, '../../../templates/script.hbs'), 'utf8').toString());

bus.on('http/init', app => {
	app.use(route.get(config.google.login_url, function *() {
		this.body = scriptTemplate({
			title: 'Logging in with Google',
			script: SCRIPT_REDIRECT
		});
	}));

	app.use(route.get(config.google.redirect_path, function *() {
		this.body = scriptTemplate({
			title: 'Logging in with Google',
			script: SCRIPT_MESSAGE
		});
	}));
});

winston.info('Google module ready.');
