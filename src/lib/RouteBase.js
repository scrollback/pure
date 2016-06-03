/* @flow */

import type { Route } from './RouteTypes';

export function processURL(url: string): string {
	return url
			.replace(/^([a-z]+\:)?\/\/[^\/]+/, '') // strip host and protocol
			.replace(/^\/|\/$/g, ''); // strip leading and trailing slash
}

export function decodeParams(query: string, transform?: Function): Object {
	const params = query.split('&');
	const props = {};

	if (params) {
		for (let i = 0, l = params.length; i < l; i++) {
			const kv = params[i].split('=');
			const key = decodeURIComponent(kv[0]);
			const value = decodeURIComponent(kv[1]);

			props[key] = transform ? transform(key, value) : value;
		}
	}

	return props;
}

export function convertRouteToURL(route: Route): string {
	const params = [];

	if (route.props) {
		for (const p in route.props) {
			const value = route.props[p];

			params.push(`${encodeURIComponent(p)}${value ? '=' + encodeURIComponent(value) : ''}`);
		}
	}

	return `/p/${route.name}${params.length ? '?' + params.join('&') : '/'}`;
}

export function convertURLToRoute(url: string, transform?: Function): Route {
	const parts = processURL(url).split('?');
	const name = parts[0].split('/')[1];
	const props = parts[1] ? decodeParams(parts[1], transform) : {};

	return {
		name,
		props,
	};
}
