/* @flow */

import type { User, Text, Thread } from '../../lib/schemaTypes';
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
} from '../../lib/Constants';

/*
 * User related actions
 */
export const initializeSession = (session: string): Object => ({
	auth: {
		session,
	},
});

export const signIn = (provider: string, auth: { accessToken: string; } | { idToken: string; } | { code: string; }): Object => ({
	auth: {
		[provider]: auth,
	},
});

export const signUp = (user: User): Object => ({
	auth: {
		signup: new UserModel({ ...user, presence: PRESENCE_FOREGROUND }),
	},
});

export const clearSignUpError = (signup: Object): Object => ({
	state: {
		signup: {
			...signup,
			error: null,
		},
	},
});

export const cancelSignUp = (): Object => ({
	state: {
		signup: null,
	},
});

export const signOut = (): Object => ({
	state: {
		session: null,
		user: null,
		initialURL: null,
	},
});

export const saveUser = (user: User): Object => ({
	entities: {
		[user.id]: new UserModel({ ...user, presence: PRESENCE_FOREGROUND }),
	},
});

export const addPlace = (user: string, type: string, place: Object): Object => ({
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
});

export const removePlace = (user: string, type: string): Object => ({
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
});

export const banUser = (): Object => ({

});

export const unbanUser = (): Object => ({

});


/*
 * Text related actions
 */
export const sendMessage = (
	data: { id?: string; body: string; meta?: ?Object; parents: Array<string>; creator: string; }
): Object => {
	const id = data.id || uuid.v4();

	return {
		entities: {
			[id]: new TextModel({
				...data,
				id,
				create: true,
				createTime: Date.now(),
				updateTime: Date.now(),
				tags: data.meta && data.meta.photo ? [ TAG_POST_PHOTO ] : [],
			}),
		},
	};
};

export const startThread = (
	data: { id?: string; name: string; body: string; meta?: ?Object; parents: Array<string>; creator: string; }
): Object => {
	const id = data.id || uuid.v4();

	return {
		entities: {
			[id]: new ThreadModel({
				...data,
				id,
				create: true,
				createTime: Date.now(),
				updateTime: Date.now(),
				tags: data.meta && data.meta.photo ? [ TAG_POST_PHOTO ] : [],
			}),
		},
	};
};

export const hideText = (text: Text): Object => ({
	entities: {
		[text.id]: new TextModel({
			id: text.id,
			tags: text.tags ? text.tags.concat(TAG_POST_HIDDEN) : [ TAG_POST_HIDDEN ],
		}),
	},
});

export const unhideText = (text: Text): Object => {
	if (text.tags) {
		const i = text.tags.indexOf(TAG_POST_HIDDEN);

		if (i > -1) {
			return {
				entities: {
					[text.id]: new TextModel({
						id: text.id,
						tags: text.tags ? text.tags.filter(e => {
							return e === TAG_POST_HIDDEN ? false : e;
						}) : [],
					}),
				},
			};
		}
	}

	return {};
};

export function likeText(text: string, user: string, roles: Array<number>): Object {
	if (roles.indexOf(ROLE_UPVOTE) === -1) {
		const id = `${user}_${text}`;
		const textrel = new TextRelModel({
			id,
			roles: roles.concat(ROLE_UPVOTE),
			item: text,
			user,
		});

		return {
			entities: {
				[id]: textrel,
			},
		};
	}

	return {};
}

export const unlikeText = (text: string, user: string, roles: Array<number>): Object => {
	if (roles.indexOf(ROLE_UPVOTE) > -1) {
		const id = `${user}_${text}`;
		const textrel = new TextRelModel({
			id,
			roles: roles.filter(role => role === ROLE_UPVOTE),
			item: text,
			user,
		});

		return {
			entities: {
				[id]: textrel,
			},
		};
	}

	return {};
};

export const hideThread = (thread: Thread): Object => ({
	entities: {
		[thread.id]: new ThreadModel({
			id: thread.id,
			tags: thread.tags ? thread.tags.concat(TAG_POST_HIDDEN) : [ TAG_POST_HIDDEN ],
		}),
	},
});

export const unhideThread = (thread: Thread): Object => {
	if (thread.tags) {
		const i = thread.tags.indexOf(TAG_POST_HIDDEN);


		if (i > -1) {
			return {
				entities: {
					[thread.id]: new ThreadModel({
						id: thread.id,
						tags: thread.tags ? thread.tags.filter(e => {
							return e === TAG_POST_HIDDEN ? false : e;
						}) : [],
					}),
				},
			};
		}
	}

	return {};
};

export function likeThread(thread: string, user: string, roles: Array<number>): Object {
	if (roles.indexOf(ROLE_UPVOTE) === -1) {
		const id = `${user}_${thread}`;
		const threadrel = new ThreadRelModel({
			id,
			roles: roles.concat(ROLE_UPVOTE),
			item: thread,
			user,
		});

		return {
			entities: {
				[id]: threadrel,
			},
		};
	}

	return {};
}

export const unlikeThread = (thread: string, user: string, roles: Array<number>): Object => {
	if (roles.indexOf(ROLE_UPVOTE) > -1) {
		const id = `${user}_${thread}`;
		const threadrel = new ThreadRelModel({
			id,
			roles: roles.filter(role => role === ROLE_UPVOTE),
			item: thread,
			user,
		});

		return {
			entities: {
				[id]: threadrel,
			},
		};
	}

	return {};
};

/*
 * Notification related actions
 */
export const dismissAllNotes = (): Object => ({

});

export const dismissNote = (): Object => ({

});

/*
 * Presence related actions
 */

export const setPresence = (id: string, status: 'online' | 'offline'): Object => ({
	entities: {
		[id]: new UserModel({
			id,
			presence: status === 'online' ? PRESENCE_FOREGROUND : PRESENCE_NONE,
		}),
	},
});

export const setItemPresence = (
	presence: { item: string; user: string; roles: Array<number>; create?: boolean },
	type: 'room' | 'thread', status: 'online' | 'offline'
): Object => {
	const rel = {
		...presence,
		presence: status === 'online' ? PRESENCE_FOREGROUND : PRESENCE_NONE,
	};

	switch (type) {
	case 'room':
		return {
			entities: {
				[`${presence.user}_${presence.item}`]: new RoomRelModel(rel),
			},
		};
	case 'thread':
		return {
			entities: {
				[`${presence.user}_${presence.item}`]: new ThreadRelModel(rel),
			},
		};
	default:
		return {};
	}
};
