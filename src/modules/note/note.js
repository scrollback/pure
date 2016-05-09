/* @flow */

import {
	APP_PRIORITIES,
	TYPE_NOTE,
	TYPE_TEXTREL,
	NOTE_MENTION,
	ROLE_MENTIONED,
} from '../../lib/Constants';
import promisify from '../../lib/promisify';
import { convertRouteToURL } from '../../lib/Route';
import { note as Note } from '../../models/models';
import { bus, cache, config } from '../../core-server';
import type {
	Note as NoteType,
	Text as TextType,
	Thread as ThreadType,
	Room as RoomType,
	TextRel as TextRelType,
} from '../../lib/schemaTypes';

const server = `${config.server.protocol}//${config.server.host}`;

const getEntityAsync = promisify(cache.getEntity.bind(cache));

export async function getTextParents(text: TextType): Promise<?{ room: RoomType; thread: ThreadType; }> {
	let room: ?RoomType, thread: ?ThreadType;

	if (text.parents) {
		room = await getEntityAsync(text.parents[1]);
		thread = await getEntityAsync(text.parents[0]);

		if (room && thread) {
			return { room, thread };
		}
	}

	return null;
}

export function createMention(
	textrel: TextRelType, text: TextType,
	{ room, thread }: { room: RoomType; thread: ThreadType; },
	now: number
): Note {
	const note: NoteType = {
		group: thread.id,
		user: textrel.user,
		event: NOTE_MENTION,
		type: TYPE_NOTE,
		createTime: now,
		updateTime: now,
		count: 1,
		score: 50,
		data: {
			id: text.id,
			creator: text.creator,
			picture: `${server}/i/picture?user=${text.creator}&size=${128}`,
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
			title: `${room.name}: ${text.creator} mentioned you in ${thread.name}`,
			body: text.body,
		},
	};

	return new Note(note);
}

export function isMentioned(entity: Object): boolean {
	return !!(entity.type === TYPE_TEXTREL && entity.roles && entity.roles.includes(ROLE_MENTIONED));
}

export function getRolesFromChanges(changes: Object): Array<{ type: number; relation: Object; item: Object }> {
	const notes = [];

	if (changes.entities) {
		for (const id in changes.entities) {
			const relation = changes.entities[id];

			if (isMentioned(relation)) {
				notes.push({
					type: ROLE_MENTIONED,
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
		let item, parents;

		switch (role.type) {
		case ROLE_MENTIONED:
			item = role.item || await getEntityAsync(role.relation.item);
			parents = item && item.id ? await getTextParents(item.id) : null;

			if (item && parents) {
				return createMention(
					role.relation,
					item,
					parents,
					Date.now()
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
