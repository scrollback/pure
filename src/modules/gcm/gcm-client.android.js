/* @flow */

import store from '../store/store';
import GCMPreferences from '../../ui/modules/GCMPreferences';

store.observe({ type: 'state', path: 'session', source: 'gcm' }).forEach(session => {
	if (session === '@@loading') {
		return;
	}

	GCMPreferences.saveSession(session || '');
});
