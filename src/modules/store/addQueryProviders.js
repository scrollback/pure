/* @flow */

import type {
	StoreCreator,
	Action,
	Reducer,
	State,
	QueryProvider,
} from './storeTypeDefinitions';

export default function addQueryProvider(...providers: Array<QueryProvider>) {
	return (createStore: StoreCreator) => (reducer: Reducer, preloadedState: State, enhancer: Function) => {
		/* eslint-disable no-use-before-define */
		const store = createStore(reducer, preloadedState, enhancer);
		const subscriptions = [];

		let providerAPI = {
			get: getPath,
			observe: observePath,
		};

		providers.forEach(provider => {
			providerAPI = provider(providerAPI);
		});

		function dispatch(action: Action) {
			const oldState = store.getState();
			store.dispatch(action);
			const currentState = store.getState();
			subscriptions.forEach(({ path, callback }) => {
				if (typeof oldState !== 'undefined' && typeof currentState !== 'undefined' && oldState[path] !== currentState[path]) {
					callback(currentState[path]);
				}
			});
		}

		function getPath(options: any): any {
			if (options.type === 'state') {
				const currentState = store.getState();
				if (typeof currentState === 'undefined') {
					return null;
				}
				return currentState[options.path];
			}

			return null;
		}

		function observePath(options: any): any {
			return new Observable(observer => {
				if (options.type === 'state') {
					const callback = data => observer.next(data);
					const listener = { path: options.path, callback };
					subscriptions.push(listener);
					try {
						observer.next(providerAPI.get(options));
					} catch (e) {
						observer.error(e);
					}
					return () => {
						const index = subscriptions.indexOf(listener);
						if (index > -1) {
							subscriptions.splice(index, 1);
						}
					};
				} else {
					observer.error(new Error('Invalid subscription'));
				}
				return () => {};
			});
		}

		return {
			...store,
			...providerAPI,
			dispatch,
		};
	};
}
