/* @flow */

import { bus, cache } from '../../core-client';

cache.onChange(changes => {
	bus.emit('postchange', changes);
});

bus.on('change', changes => {
	cache.put(changes);
});

bus.on('error', changes => {
	if (changes.state) {
		const { ...state } = changes.state; // eslint-disable-line no-use-before-define

		cache.put({ state });
	}
});

bus.emit('state:init', {}, (err, state) => {
	if (err) {
		return;
	}

	bus.emit('change', { state });
});
