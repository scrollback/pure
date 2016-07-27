/* @flow */

import { LoginManager } from 'react-native-fbsdk';
import GoogleSignIn from '../../ui/modules/GoogleSignIn';
import { bus } from '../../core-client';
import type { Action } from '../../modules/store/SimpleStoreTypes';

export default function(action: Action) {
	switch (action.type) {
	case 'SIGNOUT':
		bus.emit('signout'); // FIXME: temporary
		bus.emit('change', {
			state: {
				session: null,
				user: null,
				initialURL: null,
			},
		});
		LoginManager.logOut();
		GoogleSignIn.signOut();
		break;
	}
}
