/* @flow */

import type { Action } from '../../modules/store/storeTypeDefinitions';

export default function(state: string = 'connecting', action: Action) {
	switch (action.type) {
	case 'SOCKET_ONLINE':
		return 'online';
	case 'SOCKET_OFFLINE':
		return 'offline';
	case 'SOCKET_RECONNECT':
		return 'connecting';
	default:
		return state;
	}
}
