/* @flow */

import UserModel from '../../models/user';
import ThreadModel from '../../models/thread';
import TextModel from '../../models/text';
import TextRelModel from '../../models/textrel';
import RoomRelModel from '../../models/roomrel';
import ThreadRelModel from '../../models/threadrel';
import uuid from 'node-uuid';
import {
	PRESENCE_FOREGROUND,
	PRESENCE_NONE,
	TAG_POST_PHOTO,
	TAG_POST_HIDDEN,
	ROLE_UPVOTE,
	ROLE_FOLLOWER,
	ROLE_SHARE,
} from '../../lib/Constants';
import type { User } from '../../lib/schemaTypes';
import type { Action } from '../../modules/store/SimpleStoreTypes';

/*
 * User related actions
 */
export const initializeSession = (session: string): Action => ({
	type: 'AUTH',
	payload: {
		session,
	}
});

export const signIn = (provider: string, auth: { accessToken: string; } | { idToken: string; } | { code: string; }): Action => ({
	type: 'AUTH',
	payload: {
		[provider]: auth,
	},
});

export const signUp = (user: User): Action => ({
	type: 'AUTH',
	payload: {
		signup: new UserModel({ ...user, presence: PRESENCE_FOREGROUND }),
	},
});

export const clearSignUpError = (signup: Object): Action => ({
	type: 'SET_STATE',
	payload: {
		signup: {
			...signup,
			error: null,
		},
	},
});

export const cancelSignUp = (): Action => ({
	type: 'SET_STATE',
	payload: {
		signup: null,
	},
});

export const resetSession = (): Object => ({
	type: 'SET_STATE',
	payload: {
		session: null,
		user: null,
		initialURL: null,
	},
});

export const saveUser = (user: User): Action => ({
	type: 'CHANGE',
	payload: {
		entities: {
			[user.id]: new UserModel({ ...user, presence: PRESENCE_FOREGROUND }),
		},
	},
});

export const addPlace = (user: string, type: string, place: Object): Action => ({
	type: 'CHANGE',
	payload: {
		entities: {
			[user]: new UserModel({
				id: user,
				params: {
					places: {
						[type]: place,
					},
				},
				presence: PRESENCE_FOREGROUND,
			}),
		},
	},
});

export const removePlace = (user: string, type: string): Action => ({
	type: 'CHANGE',
	payload: {
		entities: {
			[user]: new UserModel({
				id: user,
				params: {
					places: {
						[type]: null,
					},
				},
				presence: PRESENCE_FOREGROUND,
			}),
		},
	},
});

export const banUser = (): Action => ({
	type: 'NOOP'
});

export const unbanUser = (): Action => ({
	type: 'NOOP'
});


/*
 * Text related actions
 */
export const sendMessage = (
	data: { id?: string; body: string; meta?: ?Object; room: string; thread: string; user: string; }
): Action => {
	const id = data.id || uuid.v4();

	return {
		type: 'CHANGE',
		payload: {
			entities: {
				[id]: new TextModel({
					id,
					body: data.body,
					meta: data.meta,
					parents: [ data.thread, data.room ],
					creator: data.user,
					create: true,
					createTime: Date.now(),
					updateTime: Date.now(),
					tags: data.meta && data.meta.photo ? [ TAG_POST_PHOTO ] : [],
				}),
				[`${data.user}_${id}`]: new TextRelModel({
					item: id,
					user: data.user,
					roles: [ ROLE_FOLLOWER ],
				}),
			},
		},
	};
};

export const startThread = (
	data: { id?: string; name: string; body: string; meta?: ?Object; room: string; user: string; }
): Action => {
	const id = data.id || uuid.v4();

	return {
		type: 'CHANGE',
		payload: {
			entities: {
				[id]: new ThreadModel({
					id,
					name: data.name,
					body: data.body,
					meta: data.meta,
					parents: [ data.room ],
					creator: data.user,
					createTime: Date.now(),
					updateTime: Date.now(),
					tags: data.meta && data.meta.photo ? [ TAG_POST_PHOTO ] : [],
				}),
				[`${data.user}_${id}`]: new ThreadRelModel({
					item: id,
					user: data.user,
					roles: [ ROLE_FOLLOWER ],
				}),
			},
		},
	};
};

export function hideText(text: string, tags: Array<number> = []): Action {
	if (tags.indexOf(TAG_POST_HIDDEN) === -1) {
		return {
			type: 'CHANGE',
			payload: {
				entities: {
					[text]: new TextModel({
						id: text,
						tags: tags.concat(TAG_POST_HIDDEN),
					}),
				},
			},
		};
	}
	return { type: 'NOOP' };
}

export function unhideText(text: string, tags: Array<number> = []): Action {
	if (tags.indexOf(TAG_POST_HIDDEN) > -1) {
		return {
			type: 'CHANGE',
			payload: {
				entities: {
					[text]: new TextModel({
						id: text,
						tags: tags.filter(e => {
							return e === TAG_POST_HIDDEN ? false : e;
						}),
					}),
				},
			},
		};
	}

	return { type: 'NOOP' };
}

export function likeText(text: string, user: string, roles: Array<number>): Action {
	if (roles.indexOf(ROLE_UPVOTE) === -1) {
		const id = `${user}_${text}`;
		const textrel = new TextRelModel({
			id,
			roles: roles.concat(ROLE_UPVOTE),
			item: text,
			user,
		});

		return {
			type: 'CHANGE',
			payload: {
				entities: {
					[id]: textrel,
				},
			},
		};
	}
	return { type: 'NOOP' };
}

export const unlikeText = (text: string, user: string, roles: Array<number>): Action => {
	if (roles.indexOf(ROLE_UPVOTE) > -1) {
		const id = `${user}_${text}`;
		const textrel = new TextRelModel({
			id,
			roles: roles.filter(role => role !== ROLE_UPVOTE),
			item: text,
			user,
		});

		return {
			type: 'CHANGE',
			payload: {
				entities: {
					[id]: textrel,
				},
			},
		};
	}
	return { type: 'NOOP' };
};

export function hideThread(thread: string, tags: Array<number> = []): Action {
	if (tags.indexOf(TAG_POST_HIDDEN) === -1) {
		return {
			type: 'CHANGE',
			payload: {
				entities: {
					[thread]: new ThreadModel({
						id: thread,
						tags: tags.concat(TAG_POST_HIDDEN),
					}),
				},
			},
		};
	}
	return { type: 'NOOP' };
}

export function unhideThread(thread: string, tags: Array<number> = []): Action {
	if (tags.indexOf(TAG_POST_HIDDEN) > -1) {
		return {
			type: 'CHANGE',
			payload: {
				entities: {
					[thread]: new ThreadModel({
						id: thread,
						tags: tags.filter(e => {
							return e === TAG_POST_HIDDEN ? false : e;
						}),
					}),
				},
			},
		};
	}
	return { type: 'NOOP' };
}

export function likeThread(thread: string, user: string, roles: Array<number> = []): Action {
	if (roles.indexOf(ROLE_UPVOTE) === -1) {
		const id = `${user}_${thread}`;
		const threadrel = new ThreadRelModel({
			id,
			roles: roles.concat(ROLE_UPVOTE),
			item: thread,
			user,
		});

		return {
			type: 'CHANGE',
			payload: {
				entities: {
					[id]: threadrel,
				},
			},
		};
	}
	return { type: 'NOOP' };
}

export function unlikeThread(thread: string, user: string, roles: Array<number> = []): Action {
	if (roles.indexOf(ROLE_UPVOTE) > -1) {
		const id = `${user}_${thread}`;
		const threadrel = new ThreadRelModel({
			id,
			roles: roles.filter(role => role !== ROLE_UPVOTE),
			item: thread,
			user,
		});

		return {
			type: 'CHANGE',
			payload: {
				entities: {
					[id]: threadrel,
				},
			},
		};
	}
	return { type: 'NOOP' };
}

export function shareThread(thread: string, user: string, roles: Array<number> = []): Action {
	if (roles.indexOf(ROLE_SHARE) === -1) {
		const id = `${user}_${thread}`;
		const threadrel = new ThreadRelModel({
			id,
			roles: roles.concat(ROLE_SHARE),
			item: thread,
			user,
		});

		return {
			type: 'CHANGE',
			payload: {
				entities: {
					[id]: threadrel,
				},
			},
		};
	}
	return { type: 'NOOP' };
}

/*
 * Notification related actions
 */
export const markAllNotesAsRead = (): Action => ({
	type: 'MARK_ALL_NOTES_AS_READ',
});

export const dismissAllNotes = (): Action => ({
	type: 'DISMISS_ALL_NOTES',
});

export const dismissNote = (id: string): Action => ({
	type: 'DISMISS_NOTE',
	payload: {
		id,
	},
});

/*
 * Presence related actions
 */

export const setPresence = (id: string, status: 'online' | 'offline'): Action => ({
	type: 'CHANGE',
	payload: {
		entities: {
			[id]: new UserModel({
				id,
				presence: status === 'online' ? PRESENCE_FOREGROUND : PRESENCE_NONE,
			}),
		},
	},
});

export const setItemPresence = (
	presence: { item: string; user: string; roles: Array<number>; create?: boolean },
	type: 'room' | 'thread', status: 'online' | 'offline'
): Action => {
	const rel = {
		...presence,
		presence: status === 'online' ? PRESENCE_FOREGROUND : PRESENCE_NONE,
	};

	let changes;

	switch (type) {
	case 'room':
		changes = {
			entities: {
				[`${presence.user}_${presence.item}`]: new RoomRelModel(rel),
			},
		};
		break;
	case 'thread':
		changes = {
			entities: {
				[`${presence.user}_${presence.item}`]: new ThreadRelModel(rel),
			},
		};
		break;
	}

	if (changes) {
		return {
			type: 'CHANGE',
			payload: changes,
		};
	}

	return { type: 'NOOP' };
};
