import { bus, cache } from '../../core-server';
import * as Constants from '../../lib/Constants';

const resourceMap = {};

bus.on('presence/offline', presence => {
	const user = resourceMap[presence.resource];

	if (user) {
		cache.getEntity(user, (err, u) => {
			if (err || !u) {
				return;
			}

			u.resources = u.resources || {};
			u.resources = {
				[presence.resource]: [ '$delete' ],
			};

			bus.emit('change', {
				entities: {
					[user]: u,
				},
				events: [ {
					type: 'global-offline',
					user,
					data: {
						resource: presence.resource
					}
				} ],
				source: 'belong'
			});
		});
	}

	delete resourceMap[presence.resource];
});

bus.on('presence/online', presence => {
	resourceMap[presence.resource] = presence.user;

	bus.emit('change', {
		events: [ {
			type: 'global-online',
			user: presence.user,
			data: {
				resource: presence.resource
			}
		} ],
		source: 'belong'
	});
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
bus.on('change', (changes) => {
	if (changes.entities) {
		changes.events = [];
		Object.keys(changes.entities).forEach(entity => {
			if (entity.type >= Constants.TYPE_REL && entity.type <= Constants.TYPE_PRIVREL && 'presence' in entity) {
				let type;

				switch (entity.presence) {
				case Constants.PRESENCE_FOREGROUND:
					type = 'local-online';
					break;
				case Constants.PRESENCE_BACKGROUND:
					type = 'local-background';
					break;
				case Constants.PRESENCE_NONE:
					type = 'local-offline';
					break;
				}

				changes.events.push({
					type,
					user: changes.auth.user,
					data: {
						resource: changes.auth.resource
					}
				});
			}
		});
	}
});

bus.on('s3/getPolicy', resourceHandler, Constants.APP_PRIORITIES.AUTHENTICATION_RESOURCE);
