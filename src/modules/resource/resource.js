import { bus, cache } from '../../core-server';
import * as Constants from '../../lib/Constants';

const resourceMap = {};

bus.on('presence/offline', presence => {
	const user = resourceMap[presence.resource];

	if (user) {
		cache.getEntity(user, (err, u) => {
			if (err) {
				return;
			}

			u.resources = u.resources || {};
			u.resources.__op__ = {
				[presence.resource]: 'delete'
			};

			bus.emit('change', {
				entities: {
					[user]: u
				}
			});
		});
	}

	delete resourceMap[presence.resource];
});

bus.on('presence/online', presence => {
	resourceMap[presence.resource] = presence.user;
});

// TODO: write a module to throw errors if all the auth module fail in setting changes.state.user.
function resourceHandler(changes) {
	if (changes.auth && changes.auth.user) {
		resourceMap[changes.auth.resource] = changes.auth.user;
	} else if (changes.auth && changes.auth.resource) {
		if (resourceMap[changes.auth.resource]) {
			changes.auth.user = resourceMap[changes.auth.resource];
		}
	}
}

bus.on('change', resourceHandler, Constants.APP_PRIORITIES.AUTHENTICATION_RESOURCE);
bus.on('s3/getPolicy', resourceHandler, Constants.APP_PRIORITIES.AUTHENTICATION_RESOURCE);
