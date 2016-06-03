/* @flow */

export type Route = {
	name: string;
	props?: {
		[key: string]: ?string
	};
}

export type NavigationState = {
	children: Array<Route>;
	index: number;
}

export type NavigationAction = {
	type: 'push' | 'pop' | 'back';
	payload?: Route;
}
