import { bus } from '../../core-base';
import { TYPE_USER, APP_PRIORITIES } from '../../lib/Constants';
import EnhancedError from '../../lib/EnhancedError';
import winston from 'winston';

bus.on('change', (changes, next) => {
	winston.info('user validation:');
	if (!changes.entities) return next();

	for (const id in changes.entities) {
		const entity = changes.entities[id];
		if (entity.type === TYPE_USER) {
			// list of validation for user creation
			if (!entity.identities || !entity.identities.length) {
				return next(new EnhancedError(
					'INVALID_USER_IDENTITIES',
					'INVALID_USER_IDENTITIES'
				));
			}
		}
	}

	return next();
}, APP_PRIORITIES.USER_VALIDATION);
