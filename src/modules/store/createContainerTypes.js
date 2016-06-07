/* @flow */

import SimpleStore from './SimpleStore';

export type SubscriptionPropsMap = {
	[key: string]: string | {
		key: string | { type?: string; };
	}
};

export type DispatchPropsMap = {
	[key: string]: (store: SimpleStore, result: any, props: any) => Function
};
