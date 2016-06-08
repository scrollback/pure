/* @flow */

import {
	APP_PRIORITIES,
	TYPE_NOTE,
	TYPE_TEXTREL,
	NOTE_MENTION,
	NOTE_UPVOTE,
	ROLE_MENTIONED,
	ROLE_UPVOTE,
	TYPE_THREADREL,
	TYPE_TEXT,
	TYPE_THREAD
} from '../../lib/Constants';
import promisify from '../../lib/promisify';
import { convertRouteToURL } from '../../lib/Route';
import { note as Note } from '../../models/models';
import { bus, cache, config } from '../../core-server';
import type {
	Note as NoteType,
	Thread as ThreadType,
	Text as TextType,
	Room as RoomType,
	Relation as RelationType,
} from '../../lib/schemaTypes';

const server = `${config.server.protocol}//${config.server.host}`;

const getEntityAsync = promisify(cache.getEntity.bind(cache));

export async function getTextParents(text: TextType): Promise<{ room: RoomType; thread: ThreadType; }> {
	let room: RoomType, thread: ThreadType;

	room = await getEntityAsync(text.parents[1]);
	thread = await getEntityAsync(text.parents[0]);

	return { room, thread };
}


export function createNote(
	rel: RelationType, item: ThreadType | TextType,
	{ room, thread }: { room: RoomType; thread: ThreadType; },
	now: number, type: number
): Note {
	let event = NOTE_MENTION, noteTo = rel.user, noteFrom = item.creator,
		title = `${room.name}: ${noteFrom} mentioned you in ${thread.name}`;

	if (type === ROLE_UPVOTE) {
		let subTitle;
		// console.log("item note: ",item)
		if (item.type === TYPE_TEXT) {
			subTitle = 'message';
		}
		if (item.type === TYPE_THREAD) {
			subTitle = 'discussion';
		}
		event = NOTE_UPVOTE;
		noteTo = item.creator;
		noteFrom = rel.user;
		title = `${noteFrom} liked your ${subTitle}`;
	}
	const note: NoteType = {
		group: thread.id,
		user: noteTo,
		event,
		type: TYPE_NOTE,
		createTime: now,
		updateTime: now,
		count: 1,
		score: 50,
		data: {
			id: item.id,
			creator: noteFrom,
			picture: `${server}/i/picture?user=${noteFrom}&size=${128}`,
			room: {
				id: room.id,
				name: room.name,
			},
			thread: {
				id: thread.id,
				name: thread.name,
			},
			link: server + convertRouteToURL({
				name: 'chat',
				props: {
					room: room.id,
					thread: thread.id,
				},
			}),
			title,
			body: item.body,
		},
	};

	return new Note(note);
}

export function isMentioned(entity: Object): boolean {
	return !!(entity.type === TYPE_TEXTREL && entity.roles && entity.roles.indexOf(ROLE_MENTIONED) > -1);
}

function isUpvote(entity: Object): boolean {
	return ((entity.type === TYPE_TEXTREL || TYPE_THREADREL) && entity.roles && entity.roles.includes(ROLE_UPVOTE));
}

export function getRolesFromChanges(changes: Object): Array<{ type: number; relation: Object; item: Object }> {
	const notes = [];

	if (changes.entities) {
		for (const id in changes.entities) {
			const relation = changes.entities[id];
			// console.log('relation note: ', relation)
			if (isMentioned(relation)) {
				notes.push({
					type: ROLE_MENTIONED,
					item: changes.entities[relation.item],
					relation,
				});
			}
			if (isUpvote(relation)) {
				notes.push({
					type: ROLE_UPVOTE,
					item: changes.entities[relation.item],
					relation,
				});
			}
		}
	}

	return notes;
}

export function createNotesForChanges(changes: Object): Promise<Array<?Note>> {
	return Promise.all(getRolesFromChanges(changes).map(async role => {
		const item = role.item || await getEntityAsync(role.relation.item);
		let parents;

		if (item.type === TYPE_TEXT && item.id) {
			const { room, thread } = await getTextParents(item);
			parents = {
				room,
				thread,
			};
		}

		if (item.type === TYPE_THREAD) {
			parents = {
				room: await getEntityAsync(item.parents[0]),
				thread: item
			};
		}
		switch (role.type) {
		case ROLE_MENTIONED:
		case ROLE_UPVOTE:
			if (item && parents) {
				return createNote(
					role.relation,
					item,
					parents,
					Date.now(),
					role.type
				);
			}

			return null;
		default:
			return null;
		}
	}));
}

export async function addNotesToChanges(changes: Object) {
	const notes = await createNotesForChanges(changes);

	for (let i = 0, l = notes.length; i < l; i++) {
		const note = notes[i];
		// console.log('note created: ', note);
		if (note && note.id) {
			changes.entities[note.id] = note;
		}
	}
}

bus.on('change', async (changes, next) => {
	try {
		await addNotesToChanges(changes);
		next();
	} catch (err) {
		next(err);
	}
}, APP_PRIORITIES.NOTE);
