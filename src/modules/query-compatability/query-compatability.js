import { bus, cache } from '../../core-server';

function fixChange(change) {
	if (!change.queries || change.version) return;
	for (const key in change.query) {
		const slice = cache.keyToSlice(key);
		if (
            slice.type === 'roomrel' &&
            slice.link &&
            slice.link.room === 'item'
        ) {
			slice.filter = {
				roomrel: {
					user: slice.filter.user,
					roles_cts: slice.filter.roles_cts
				}
			};
			const newKey = cache.sliceToKey(slice);
			change.queries[newKey] = change.queries[key];
			delete change.queries[key];
			change.changedQueries[newKey] = key;
		} else if (
			slice.type === 'rel' &&
            slice.link &&
            slice.link.user === 'user'
        ) {
			slice.filter = {
				rel: {
					item: slice.filter.item,
					roles_cts: slice.filter.roles_cts
				}
			};
			const newKey = cache.sliceToKey(slice);
			change.queries[newKey] = change.queries[key];
			delete change.queries[key];
			change.changedQueries[newKey] = key;
		}
	}
}

bus.on('change', fixChange, 1000);
