/* @flow */

import setState from './setState';
import connectionStatus from './connectionStatus';
import initialURL from './initialURL';
import location from './location';
import session from './session';
import navigation from './navigation';
import type { Action } from '../../modules/store/storeTypeDefinitions';

export default function rootReducer(state: any, action: Action) {
	const nextState = setState(state, action);

	return {
		...nextState,
		connectionStatus: connectionStatus(nextState.connectionStatus, action),
		initialURL: initialURL(nextState.initialURL, action),
		location: location(nextState.location, action),
		session: session(nextState.session, action),
		navigation: navigation(nextState.navigation, action),
	};
}
