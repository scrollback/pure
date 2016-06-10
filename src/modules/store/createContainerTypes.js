/* @flow */

export type SubscriptionPropsMap = {
	[key: string]: string | {
		key: string | { type?: string; };
		defer?: boolean;
	}
};

export type DispatchPropsMap = {
	[key: string]: (...args: any) => any;
};
