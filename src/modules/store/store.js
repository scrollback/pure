/* @flow */

import { bus, cache } from '../../core-client';
import type { SubscriptionOptions, Subscription } from './ConnectTypes';

const LOADING = Object.freeze({ type: 'loading' });
const LOADING_ITEMS = Object.freeze([ LOADING ]);

export const subscribe = (options: SubscriptionOptions, callback: Function): Subscription => {
	let unWatch, unWatchMe, unWatchUser;

	switch (options.type) {
	case 'state':
		if (typeof options.path !== 'string') {
			throw new TypeError(`Invalid 'path' passed to store.subscribe::state in ${options.source}`);
		}

		unWatch = cache.watchState(options.path, callback);
		break;
	case 'entity':
		if (typeof options.id !== 'string') {
			throw new TypeError(`Invalid 'id' passed to store.subscribe::entity in ${options.source}`);
		}

		unWatch = cache.watchEntity(options.id, data => data && data.type === 'loading' ? callback(LOADING) : callback(data || null));
		break;
	case 'me':
		unWatchUser = cache.watchState('user', user => {
			if (unWatchMe) {
				unWatchMe();
			}

			unWatchMe = cache.watchEntity(user, data => data && data.type === 'loading' ? callback(LOADING) : callback(data || null));
		});

		unWatch = () => {
			if (unWatchMe) {
				unWatchMe();
			}

			unWatchUser();
		};

		break;
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
				throw new TypeError(`Range was not passed to store.subscribe in ${options.source}`);
			}

			let unWatchInner, handle;

			const watchItems = () => {
				unWatchInner = cache.watch(options.slice, range, ({ arr }) => {
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

			unWatch = () => {
				if (unWatchInner) {
					unWatchInner();
				}

				if (handle) {
					global.cancelIdleCallback(handle);
				}
			};
		} else {
			throw new TypeError(`Invalid options passed to store.subscribe in ${options.source}`);
		}
	}

	bus.emit('store:subscribe', options);

	return {
		remove: () => {
			unWatch();

			bus.emit('store:unsubscribe', options);
		},
	};
};

export const off = (event: string, callback: Function): void => bus.off(`store:${event}`, callback);

export const on = (event: string, callback: Function): Subscription => {
	bus.on(`store:${event}`, callback);

	return {
		remove: () => off(event, callback),
	};
};

export const dispatch = (payload: Object): void => bus.emit('change', payload);
