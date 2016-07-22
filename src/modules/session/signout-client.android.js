/* @flow */

import { LoginManager } from 'react-native-fbsdk';
import { bus } from '../../core-client';
import { signOut } from '../../modules/store/actions';
import GoogleSignIn from '../../ui/modules/GoogleSignIn';

bus.on('signout', () => {
	bus.emit('change', signOut());
	LoginManager.logOut();
	GoogleSignIn.signOut();
});
