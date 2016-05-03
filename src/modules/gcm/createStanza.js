/* @flow */

import * as Constants from '../../lib/Constants';

export default function createStanza(pushData: Object, id: string) {
	let topic;

	if (pushData.type === Constants.TYPE_THREAD) {
		topic = 'room-' + pushData.data.room;
	}
	if (pushData.type === Constants.TYPE_TEXT) {
		topic = 'thread-' + pushData.data.thread;
	}
	if (pushData.type === Constants.TYPE_NOTE) {
		topic = 'user-' + pushData.user;
	}
	const stanza = `
	<message>
	<gcm xmlns="google:mobile:data">
	{
		"to": "/topics/${topic}",
		"message_id": "${id}",
		"data": ${JSON.stringify(pushData)}
	}
	</gcm>
	</message>
	`;
	return stanza;
}
