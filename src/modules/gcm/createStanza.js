/* @flow */

import {
	TYPE_THREAD,
	TYPE_TEXT,
	TYPE_NOTE,
} from '../../lib/Constants';
import type { Note } from '../../lib/schemaTypes';

export default function createStanza(id: string, note: Note) {
	let topic;

	if (note.type === TYPE_THREAD && note.data.room) {
		topic = 'room-' + note.data.room.id;
	}
	if (note.type === TYPE_TEXT && note.data.thread) {
		topic = 'thread-' + note.data.thread.id;
	}
	if (note.type === TYPE_NOTE && note.user) {
		topic = 'user-' + note.user;
	}
	const stanza = `
	<message>
	<gcm xmlns="google:mobile:data">
	{
		"to": "/topics/${topic}",
		"message_id": "${id}",
		"data": ${JSON.stringify(note)}
	}
	</gcm>
	</message>
	`;

	return stanza;
}
