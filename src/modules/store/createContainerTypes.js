/* @flow */

export type SubscriptionPropsMap = {
	[key: string]: string | {
		key: string | { type?: string; };
	}
};

export type DispatchPropsMap = {
	[key: string]: (...args: any) => any;
};
