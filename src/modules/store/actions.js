/* @flow */

import type { User } from '../../lib/schemaTypes';
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
} from '../../lib/Constants';

/*
 * User related actions
 */
export const initializeSession = (session: string): Object => ({
	type: 'CHANGE',
	payload: {
		auth: {
			session,
		},
	}
});

export const signIn = (provider: string, auth: { accessToken: string; } | { idToken: string; } | { code: string; }): Object => ({
	type: 'CHANGE',
	payload: {
		auth: {
			[provider]: auth,
		},
	},
});

export const signUp = (user: User): Object => ({
	type: 'CHANGE',
	payload: {
		auth: {
			signup: new UserModel({ ...user, presence: PRESENCE_FOREGROUND }),
		},
	},
});

export const clearSignUpError = (signup: Object): Object => ({
	type: 'CHANGE',
	payload: {
		state: {
			signup: {
				...signup,
				error: null,
			},
		},
	},
});

export const cancelSignUp = (): Object => ({
	type: 'CHANGE',
	payload: {
		state: {
			signup: null,
		},
	},
});

export const resetSession = (): Object => ({
	type: 'CHANGE',
	payload: {
		state: {
			session: null,
			user: null,
			initialURL: null,
		},
	},
});

export const saveUser = (user: User): Object => ({
	type: 'CHANGE',
	payload: {
		entities: {
			[user.id]: new UserModel({ ...user, presence: PRESENCE_FOREGROUND }),
		},
	},
});

export const addPlace = (user: string, type: string, place: Object): Object => ({
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

export const removePlace = (user: string, type: string): Object => ({
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

export const banUser = (): Object => ({

});

export const unbanUser = (): Object => ({

});


/*
 * Text related actions
 */
export const sendMessage = (
	data: { id?: string; body: string; meta?: ?Object; room: string; thread: string; user: string; }
): Object => {
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
): Object => {
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

export function hideText(text: string, tags: Array<number> = []): Object {
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
	return {};
}

export function unhideText(text: string, tags: Array<number> = []): Object {
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

	return {};
}

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
			type: 'CHANGE',
			payload: {
				entities: {
					[id]: textrel,
				},
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
	return {};
};

export function hideThread(thread: string, tags: Array<number> = []): Object {
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
	return {};
}

export function unhideThread(thread: string, tags: Array<number> = []): Object {
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
	return {};
}

export function likeThread(thread: string, user: string, roles: Array<number> = []): Object {
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
	return {};
}

export function unlikeThread(thread: string, user: string, roles: Array<number> = []): Object {
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
	return {};
}

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
): Object => {
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

	return {};
};
