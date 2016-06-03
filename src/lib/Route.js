/* @flow */

import type { NavigationState, Route } from './RouteTypes';
import * as RouteBase from './RouteBase';

function transformParam(key, value) {
	if (key === 'time' || key === 'page') {
		return parseInt(value, 10);
	} else {
		return value;
	}
}

export function convertRouteToURL(route: Route): string {
	if (typeof route !== 'object' || route === null || typeof route.name !== 'string') {
		throw new TypeError('Invalid route given');
	}

	const home = {
		name: 'home',
	};

	switch (route.name) {
	case 'room':
		if (route.props && route.props.room) {
			return `/${encodeURIComponent(route.props.room)}/`;
		}

		return RouteBase.convertRouteToURL(home);
	case 'chat':
		if (route.props && route.props.room && route.props.thread) {
			let title;

			if (route.props.title) {
				title = encodeURIComponent(route.props.title.toLowerCase().trim().replace(/['"]/g, '').replace(/\W+/g, '-').replace(/\-$/, ''));
			} else {
				title = '';
			}

			const room = encodeURIComponent(route.props.room);
			// $FlowFixMe - Already checking for route.props
			const thread = encodeURIComponent(route.props.thread);

			return `/${room}/${thread}/${title}`;
		}

		return RouteBase.convertRouteToURL(home);
	default:
		return RouteBase.convertRouteToURL(route);
	}
}

export function convertURLToRoute(url: string): Route {
	if (typeof url !== 'string') {
		throw new TypeError('Invalid URL given');
	}

	const processed = RouteBase.processURL(url);

	if (processed.indexOf(':') === 0) {
		return RouteBase.convertURLToRoute(processed, transformParam);
	}

	const parts = processed.split('?');
	const paths = parts[0].split('/');
	const props = parts[1] ? RouteBase.decodeParams(parts[1], transformParam) : {};
	const type = paths[0] ? decodeURIComponent(paths[0]).toLowerCase() : null;
	const name = paths[1] ? decodeURIComponent(paths[1]).toLowerCase() : null;

	if (type) {
		if (name) {
			if (name === 'all') {
				return {
					name: 'room',
					props: {
						...props,
						room: type,
					},
				};
			}

			if (type.length >= 3) {
				return {
					name: 'chat',
					props: {
						...props,
						room: type,
						thread: name,
					},
				};
			}
		} else {
			if (type.length >= 3) {
				return {
					name: 'room',
					props: {
						...props,
						room: type,
					},
				};
			}
		}
	}

	return {
		name: 'home',
	};
}

const stacks = {
	home: [ 'home' ],
	chat: [ 'home', 'room', 'chat' ],
	compose: [ 'home', 'room', 'compose' ],
	details: [ 'home', 'room', 'chat', 'details' ],
};

export function convertRouteToState(route: Route): NavigationState {
	const stack = stacks[route.name] || [ 'home', route.name ];

	return {
		children: stack.map(name => ({
			name,
			props: route.props,
		})),
		index: stack.length - 1,
	};
}

export function convertURLToState(url: string): NavigationState {
	return convertRouteToState(convertURLToRoute(url));
}
