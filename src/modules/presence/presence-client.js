/* @flow */

import { cache } from '../../core-client';
import store from '../store/store';
import { setPresence, setItemPresence } from '../store/actions';
import { ROLE_VISITOR } from '../../lib/Constants';
import promisify from '../../lib/promisify';

const getEntityAsync = promisify(cache.getEntity.bind(cache));

function getItemFromFilter(filter) {
	if (filter) {
		if (filter.thread && filter.thread.parents_first) {
			return filter.thread.parents_first;
		} else if (filter.text && filter.text.parents_first) {
			return filter.text.parents_first;
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

	const user = store.getState().user;
	const item = getItemFromFilter(slice.filter);

	if (item) {
		const result = await getEntityAsync(`${user}_${item}`);

		global.requestIdleCallback(() => {
			if (result) {
				store.dispatch(setItemPresence(result, type, status));
			} else {
				store.dispatch(setItemPresence({
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
		store.dispatch(setPresence(id, 'online'));
	}
});

cache.onWatch(({ slice }) => {
	if (slice) {
		getRelationAndSetPresence(slice, 'online');
	}
});

cache.onUnWatch(({ slice }) => {
	if (slice) {
		getRelationAndSetPresence(slice, 'offline');
	}
});
