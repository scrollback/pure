/* @flow */

import { TAG_USER_CONTENT } from '../../lib/Constants';
import { subscribe, dispatch } from '../store/store';
import { cache, config } from '../../core-client';
import PersistentStorage from '../../lib/PersistentStorage';

const sessionListStorage = new PersistentStorage('sessionList');

const {
	server: {
		host,
		protocol,
	},
} = config;


function saveList(list) {
	dispatch({ state: { sessionList: list } });
}

function removeList() {
	dispatch({ state: { sessionList: null } });
}


/*
 * When the user changes, we look for a tag in the user object
 * If it exists, we fetch the new list
 * If it doesn't exist, we check if the user id exists in the current list
 * If it doesn't exist in the current list, clear the current list
 */

subscribe({ type: 'me', source: 'sessionswitcher' }, async user => {
	if (!user) {
		return;
	}

	if (user.tags && user.tags.indexOf(TAG_USER_CONTENT) > -1) {
		const res = await fetch(`${protocol}//${host}/s/session_list.json`);

		try {
			const list = await res.json();

			// If current user is not in the list, add it
			let exists;

			for (let i = 0, l = list.length; i < l; i++) {
				if (list[i] && list[i].user === user.id) {
					exists = true;
					break;
				}
			}

			if (!exists) {
				list.unshift({
					user: user.id,
					session: cache.getState('session')
				});
			}

			sessionListStorage.setItem('list', list);
			saveList(list);
		} catch (e) {
			removeList();
		}
	} else {
		const list = await sessionListStorage.getItem('list');

		if (list) {
			let exists;

			for (let i = 0, l = list.length; i < l; i++) {
				if (list[i] && list[i].user === user.id) {
					exists = true;
					break;
				}
			}

			if (exists) {
				saveList(list);
			} else {
				removeList();
			}
		} else {
			removeList();
		}
	}
 });
