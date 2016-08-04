/* @flow */

export type Route = {
	name: string;
	props?: {
		[key: string]: ?string
	};
}

export type NavigationState = {
	routes: Array<Route>;
	index: number;
}
