/* @flow */

export type State = any

export type Action = {
	type: string;
	payload?: any;
}

export type Reducer<S, A> = (state: S, action: A) => S // eslint-disable-line no-undef

export type ActionCreator = (...args: any) => Action

export type Dispatch = (action: Action) => any

export type MiddlewareAPI = {
	dispatch: Dispatch;
	getState: () => State;
}

export type Middleware = (api: MiddlewareAPI) => (next: Dispatch) => Dispatch

export type QueryGetter = (options: any) => any;

export type QueryObserver = (options: any) => Observable<any>;

export type QueryProviderAPI = {
	get: QueryGetter;
	observe: QueryObserver;
}

export type QueryProvider = (api: QueryProviderAPI) => QueryProviderAPI;

export type Store = {
	dispatch: Dispatch;
	getState: () => State;
	replaceReducer: (reducer: Reducer) => void;
	subscribe: (listener: Function) => Function;
}

export type EnhancedStore = Store & {
	get: QueryGetter;
	observe: QueryObserver;
}

export type StoreCreator = (reducer: Reducer, preloadedState?: State, enhancer?: Function) => Store

export type StoreEnhancer = (next: StoreCreator) => StoreCreator
