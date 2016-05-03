/* @flow */
import { bus, cache, config } from '../../core-server';
import { APP_PRIORITIES } from '../../lib/Constants';
import winston from 'winston';
import * as pg from '../../lib/pg';
import EnhancedError from '../../lib/EnhancedError';
import { user } from '../../models/models';

function getEntityByIdentity(identities, callback) {
	pg.read(config.connStr, {
		$: 'select *  from users where identities && &{identities}',
		identities
	}, (err, results) => {
		if (err) {
			winston.error(err.message);
			callback(err);
		} else {
			callback(null, results.map(u => new user(u)));
		}
	});
}
// sign with default (HMAC SHA256)
function signinhandler(changes, n) {
	function next(e) {
		if (e) {
			changes.response = changes.response || {};
			changes.response.state = changes.response.state || {};
			changes.response.state.signin = changes.response.state.signin || {};
			changes.response.state.signin.error = e;
			n(changes);
		} else {
			n();
		}
	}


	if (changes.auth && changes.auth.signin) {
		winston.debug('setstate: sign-in module', changes.auth.signin);
		if (changes.auth.signin.id) {
			winston.debug('setstate: sign-in module: trying to signin using id', changes.auth.signin.id);
			cache.getEntity(changes.auth.signin.id, (err, entity) => {
				if (err) {
					winston.error('setstate: sign-in module:', err.message);
					return next(err);
				}
				if (!entity) {
					winston.error('setstate: sign-in module: INVALID_USERID');
					return next(new EnhancedError('The username is invalid', 'INVALID_USERID'));
				}
				winston.info('setstate: sign-in module: found user');
				changes.auth.user = entity.id;
				changes.response = changes.response || {};
				changes.response.state = changes.response.state || {};
				changes.response.state.user = entity.id;
				changes.response.entities = changes.response.entities || {};
				changes.response.entities[entity.id] = entity;
				delete changes.auth.signin;
				return next();
			});
		} else if (changes.auth.signin.identities.length) {
			getEntityByIdentity(changes.auth.signin.identities, (err, entities) => {
				if (err) {
					return next(err);
				}

				if (entities && entities.length) {
					const entity = entities[0];

					changes.auth.user = entity.id;
					changes.response = (changes.response || {});
					(changes.response.state = changes.response.state || {}).user = entity.id;
					(changes.response.entities = changes.response.entities || {})[entity.id] = entity;
					delete changes.auth.signin;
				} else {
					changes.response = (changes.response || {});
					(changes.response.state = (changes.response.state || {})).user = null;
				}

				return next();
			});
		}
	} else {
		return next();
	}


	return null;
}

bus.on('change', signinhandler, APP_PRIORITIES.AUTHENTICATION_SIGNIN);
winston.info('Signin module ready.');
