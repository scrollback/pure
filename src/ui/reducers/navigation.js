/* @flow */

import isEqual from 'lodash/isEqual';
import { v4 } from 'node-uuid';
import type { Action } from '../../modules/store/storeTypeDefinitions';
import type { NavigationState } from '../../lib/RouteTypes';

const initialState = {
	index: 0,
	key: 'root',
	routes: [ { name: 'home', key: v4() } ],
	restoring: true,
};

export default function(state: NavigationState = initialState, { type, payload }: Action) {
	const {
		index,
		routes,
	} = state;

	switch (type) {
	case 'PUSH_ROUTE':
		if (payload) {
			const lastRoute = routes[routes.length - 1];

			if (payload.name === lastRoute.name) {
				if (payload.props || lastRoute.props) {
					if (isEqual(payload.props, lastRoute.props)) {
						return state;
					}
				} else {
					return state;
				}
			}

			return {
				...state,
				routes: [
					...routes,
					payload,
				],
				index: index + 1,
			};
		}
		return state;
	case 'POP_ROUTE':
		if (index > 0 && routes.length > 1) {
			return {
				...state,
				routes: routes.slice(0, routes.length - 1),
				index: index - 1,
			};
		}
		return state;
	case 'SET_NAVIGATION':
		return {
			...state,
			...payload,
			restoring: false,
		};
	default:
		return state;
	}
}
