/* @flow */
import {
	TYPE_USER,
	PRESENCE_FOREGROUND,
} from '../../../lib/Constants';
import type { Action } from '../../../modules/store/storeTypeDefinitions';

export default function(action: Action) {
	switch (action.type) {
	case 'CHANGE':
		return action.payload;
	case 'AUTH':
		return {
			auth: action.payload,
		};
	case 'SIGNUP':
		return {
			auth: {
				signup: {
					...action.payload,
					type: TYPE_USER,
					presence: PRESENCE_FOREGROUND,
				},
			},
		};
	case 'LOG_EVENT':
		return {
			events: [ (action.payload: any) ],
		};
	default:
		return null;
	}
}
