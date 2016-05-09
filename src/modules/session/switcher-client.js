/* @flow */

import { TAG_USER_CONTENT, TAG_USER_ADMIN } from '../../lib/Constants';
import { subscribe, dispatch } from '../store/store';
import { cache, config } from '../../core-client';
import PersistentStorage from '../../lib/PersistentStorage';

const sessionListStorage = new PersistentStorage('sessionList');
const roomListStorage = new PersistentStorage('allRoomsList');

const {
	server: {
		host,
		protocol,
	},
} = config;


function saveSessionList(list) {
	dispatch({ state: { sessionList: list } });
}

function removeSessionList() {
	dispatch({ state: { sessionList: null } });
}

function saveRoomList(list) {
	dispatch({ state: { roomList: list } });
}

function removeRoomList() {
	dispatch({ state: { sessionList: null } });
}


/*
 * When the user changes, we look for a tag in the user object
 * If it exists, we fetch the new list
 * If it doesn't exist, we check if the user id exists in the current list
 * If it doesn't exist in the current list, clear the current list
 */
async function fetchUsers(user) {
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
					session: cache.getState('session'),
				});
			}

			sessionListStorage.setItem('list', list);
			saveSessionList(list);
		} catch (e) {
			sessionListStorage.removeItem('list');
			removeSessionList();
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
				saveSessionList(list);
			} else {
				removeSessionList();
			}
		} else {
			removeSessionList();
		}
	}
}

async function fetchRooms(user) {
	if (user.tags && (user.tags.indexOf(TAG_USER_CONTENT) > -1 || user.tags.indexOf(TAG_USER_ADMIN) > -1)) {
		const currentList = await roomListStorage.getItem('list');

		if (currentList) {
			saveRoomList(currentList);
		}

		global.requestIdleCallback(async () => {
			const res = await fetch(`${protocol}//${host}/s/all_rooms_list.json`);

			try {
				const list = await res.json();

				roomListStorage.setItem('list', list);
				saveRoomList(list);
			} catch (e) {
				roomListStorage.removeItem('list');
				removeRoomList();
			}
		});
	}
 }

 subscribe({ type: 'me', source: 'sessionswitcher' }, user => {
	 if (user) {
		fetchUsers(user);
		fetchRooms(user);
	 }
 });
