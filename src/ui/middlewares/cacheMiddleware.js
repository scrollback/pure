/* @flow */

import { bus } from '../../core-client';
import type { Action } from '../../modules/store/SimpleStoreTypes';

export default function(action: Action) {
	switch (action.type) {
	case 'CHANGE':
		bus.emit('change', action.payload);
		break;
	}
}
