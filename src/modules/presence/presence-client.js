/* @flow */

import { bus, cache } from '../../core-client';
import store from '../store/store';
import { setPresence, setItemPresence } from '../store/actions';
import { ROLE_VISITOR } from '../../lib/Constants';
import promisify from '../../lib/promisify';

const getEntityAsync = promisify(cache.getEntity.bind(cache));

function getItemFromFilter(filter) {
	if (filter) {
		if (filter.thread && filter.thread.parents_cts) {
			return filter.thread.parents_cts[0];
		} else if (filter.text && filter.text.parents_cts) {
			return filter.text.parents_cts[0];
		}
	}

	return null;
}

async function getRelationAndSetPresence(slice: Object, status: 'online' | 'offline') {
	let type;

	if (slice.type === 'text') {
		type = 'thread';
	} else if (slice.type === 'thread') {
		type = 'room';
	} else {
		return;
	}

	const user = cache.getState('user');
	const item = getItemFromFilter(slice.filter);

	if (item) {
		const result = await getEntityAsync(`${user}_${item}`);

		global.requestIdleCallback(() => {
			if (result) {
				bus.emit('change', setItemPresence(result, type, status));
			} else {
				bus.emit('change', setItemPresence({
					item,
					user,
					roles: [ ROLE_VISITOR ],
					create: true,
				}, type, status));
			}
		});
	}
}

store.observe({ type: 'state', path: 'user', source: 'presence' }).forEach(id => {
	if (id) {
		bus.emit('change', setPresence(id, 'online'));
	}
});

store.on('subscribe', options => {
	if (options.slice) {
		getRelationAndSetPresence(options.slice, 'online');
	}
});

store.on('unsubscribe', options => {
	if (options.slice) {
		getRelationAndSetPresence(options.slice, 'offline');
	}
});
