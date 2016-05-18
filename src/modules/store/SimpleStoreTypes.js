/* @flow */

export type EventSubscription = {
	remove: () => void
}

export type SubscriptionSlice = {
	type: string;
	order: string;
	filter?: Object;
}

export type SubscriptionRange = {
	start: number;
	before?: number;
	after?: number;
	end?: number;
}

export type SubscriptionOptions = {
	type?: string;
	slice?: SubscriptionSlice;
	range?: SubscriptionRange;
	order?: string;
	id?: string;
	path?: string;
	source: string;
	defer?: ?boolean;
}

export type Cache = {
	watch: (options: SubscriptionOptions, callback: Function) => ?Function;
	put: (payload: any) => void;
}
