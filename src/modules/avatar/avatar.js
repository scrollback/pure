/* @flow */

import route from 'koa-route';
import { bus, cache } from '../../core-server';
import promisify from '../../lib/promisify';
import buildAvatarURLForSize from '../../lib/buildAvatarURLForSize';

const getEntityAsync = promisify(cache.getEntity.bind(cache));

bus.on('http/init', app => {
	app.use(route.get('/i/picture', function *() {
		const query = this.request.query;

		if (query && query.user) {
			const {
				user,
				size,
			} = query;

			try {
				const data = yield getEntityAsync(user);

				if (data && data.meta && data.meta.picture) {
					this.response.redirect(buildAvatarURLForSize(data.meta.picture, size));
				} else {
					this.throw(404, `Couldn't find picture for user: ${user}`);
				}
			} catch (e) {
				this.throw(500, e.message);
			}
		} else {
			this.throw(400, 'User ID is not specified for picture');
		}
	}));
});
