/* @flow */

import { bus } from '../../core-client';
import store from '../../modules/store/store';
import PersistentStorage from '../../lib/PersistentStorage';

const sessionStorage = new PersistentStorage('session');

async function saveAndInitializeSession() {
	let session = null;

	try {
		session = await sessionStorage.getItem('id');
	} catch (e) {
		// do nothing
	}

	const changes: { auth?: { session: string } } = {
		state: {
			session,
		},
	};

	if (session) {
		changes.auth = {
			session,
		};
	}

	bus.emit('change', changes);
}

bus.on('error', changes => {
	if (changes.state && changes.state.signin) {
		bus.emit('change', {
			state: {
				session: null,
			},
		});
	}
});

bus.on('state:init', state => (state.session = '@@loading'));

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
