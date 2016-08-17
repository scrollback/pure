/* @flow */

import store from '../../modules/store/store';
import PersistentStorage from '../../lib/PersistentStorage';

const sessionStorage = PersistentStorage.getInstance('session');

async function saveAndInitializeSession() {
	let session = null;

	try {
		session = await sessionStorage.getItem('id');
	} catch (e) {
		// do nothing
	}

	store.dispatch({
		type: 'SET_SESSION',
		payload: session,
	});

	if (session) {
		store.dispatch({
			type: 'AUTHORIZE',
			payload: {
				session,
			},
		});
	}
}

store.observe({ type: 'state', path: 'session', source: 'session' }).forEach(session => {
	if (session === '@@loading') {
		return;
	}

	if (typeof session === 'string' && session) {
		sessionStorage.setItem('id', session);
	}

	// remove session from storage only when explicitly removed from cache
	// session might be undefined instead of null if not initialized yet
	if (session === null) {
		sessionStorage.removeItem('id');
	}
});

store.observe({ type: 'state', path: 'connectionStatus', source: 'session' }).forEach(status => {
	if (status === 'online') {
		saveAndInitializeSession();
	}
});
