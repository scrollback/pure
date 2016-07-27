/* @flow */

import { bus } from '../../core-client';
import store from '../../modules/store/store';
import { resetSession } from '../../modules/store/actions';
import type { Action } from '../../modules/store/SimpleStoreTypes';

export default function(action: Action) {
	switch (action.type) {
	case 'SIGNOUT':
		bus.emit('signout'); // FIXME: temporary
		store.dispatch(resetSession());
		break;
	}
}
