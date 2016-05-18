/* @flow */

import SimpleStore from './SimpleStore';

export type MapSubscriptionToProps = {
	[key: string]: string | {
		key: string | { type?: string; };
		transform?: Function;
	}
};

export type MapActionsToProps = {
	[key: string]: (store: SimpleStore, result: any, props: any) => Function
};
