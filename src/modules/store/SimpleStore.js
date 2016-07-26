/* @flow */

import type {
	Cache,
	Action,
	SubscriptionOptions,
	EventSubscription,
} from './SimpleStoreTypes';

export default class SimpleStore {
	_cache: Cache;
	_middlewares: Array<Function> = [];
	_listeners: { [key: string]: Array<Function> } = {};

	constructor(cache: Cache) {
		if (typeof cache !== 'object') {
			throw new Error('Must be initialized with valid cache');
		}

		if (typeof cache.watch !== 'function') {
			throw new Error('Cache must have a "watch" method');
		}

		this._cache = cache;
	}

	observe(options: SubscriptionOptions): Observable {
		return new Observable(observer => {
			this._trigger('subscribe', options);

			const unwatch = this._cache.watch(options, data => {
				observer.next(data);
			});

			return () => {
				this._trigger('unsubscribe', options);

				if (unwatch) {
					unwatch();
				}
			};
		});
	}

	dispatch(action: Action): void {
		this._middlewares.forEach(middleware => {
			middleware(action);
		});
	}

	addMiddleware(middleware: Function): void {
		this._middlewares.push(middleware);
	}

	on(event: string, cb: Function): EventSubscription {
		let listeners;

		if (this._listeners[event]) {
			listeners = this._listeners[event];
		} else {
			listeners = this._listeners[event] = [];
		}

		listeners.push(cb);

		return {
			remove() {
				let index;

				for (let i = 0, l = listeners.length; i < l; i++) {
					if (listeners[i] !== cb) {
						continue;
					}

					index = i;
					break;
				}

				if (typeof index === 'number') {
					listeners.splice(index, 0);
				}
			}
		};
	}

	_trigger(event: string, payload?: any) {
		const listeners = this._listeners[event];

		if (listeners) {
			listeners.forEach(cb => cb(payload));
		}
	}
}
