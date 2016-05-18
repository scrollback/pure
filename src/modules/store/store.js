/* @flow */

import { bus, cache } from '../../core-client';
import SimpleStore from './SimpleStore';
import type { SubscriptionOptions } from './SimpleStoreTypes';

const LOADING = Object.freeze({ type: 'loading' });
const LOADING_ITEMS = Object.freeze([ LOADING ]);

const watch = (options: SubscriptionOptions, callback: Function) => {
	switch (options.type) {
	case 'state':
		if (typeof options.path !== 'string') {
			throw new TypeError(`Invalid 'path' passed to store.observe::state in ${options.source}`);
		}

		return cache.watchState(options.path, data => {
			callback(data);
		});
	case 'entity':
		if (typeof options.id !== 'string') {
			throw new TypeError(`Invalid 'id' passed to store.observe::entity in ${options.source}`);
		}

		return cache.watchEntity(options.id, data => {
			if (data && data.type === 'loading') {
				callback(LOADING);
			} else {
				callback(data || null);
			}
		});
	case 'me': {
		let unWatchMe;

		const unWatchUser = cache.watchState('user', user => {
			if (unWatchMe) {
				unWatchMe();
			}

			unWatchMe = cache.watchEntity(user, data => {
				if (data && data.type === 'loading') {
					callback(LOADING);
				} else {
					callback(data || null);
				}
			});
		});

		return () => {
			if (unWatchMe) {
				unWatchMe();
			}

			unWatchUser();
		};
	}
	default:
		if (options.slice) {
			let range;

			if (options.range) {
				const r = options.range;

				if ('before' in r || 'after' in r) {
					range = [ r.start, r.before || 0, r.after || 0 ];
				} else {
					range = [ r.start, r.end ];
				}
			} else {
				throw new TypeError(`Range was not passed to store.observe in ${options.source}`);
			}

			let unWatch, handle;

			const watchItems = () => {
				unWatch = cache.watch(options.slice, range, ({ arr }) => {
					if (arr.length === 1 && arr[0] && arr[0].type === 'loading') {
						callback(LOADING_ITEMS);
					} else {
						callback(arr);
					}
				});
			};

			if (options.defer) {
				callback(LOADING_ITEMS);

				handle = global.requestIdleCallback(watchItems);
			} else {
				watchItems();
			}

			return () => {
				if (unWatch) {
					unWatch();
				}

				if (handle) {
					global.cancelIdleCallback(handle);
				}
			};
		} else {
			throw new TypeError(`Invalid options passed to store.observe in ${options.source}`);
		}
	}
};

const put = (payload: Object): void => bus.emit('change', payload);

const store = new SimpleStore({
	watch,
	put,
});

export default store;
