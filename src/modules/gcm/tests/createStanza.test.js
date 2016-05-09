import test from 'ava';
import createStanza from '../createStanza';
import uid from '../../../lib/uid-server';

test('should create stanza for threads', t => {
	const data = {
		user: 'testinguser',
		event: 1,
		createTime: 1457003330852,
		updateTime: 1457003330852,
		type: 40,
		group: 'shagf7-sdfhg834-dskfg834',
		data: {
			id: 'hags732-dsf-sdr32a',
			from: 'sbtestinguser',
			text: '@testinguser hi',
			thread: {
				id: 'somethreadid',
				name: 'some thread title',
			},
			createTime: 1457003330852,
			room: {
				id: 'scrollback',
				name: 'Scrollback',
			},
		},
	};

	const id = uid();
	const stanza = createStanza(id, data);
	const result = `
	<message>
	<gcm xmlns="google:mobile:data">
	{
		"to": "/topics/user-testinguser",
		"message_id": "${id}",
		"data": {"user":"testinguser","event":1,"createTime":1457003330852,"updateTime":1457003330852,"type":40,"group":"shagf7-sdfhg834-dskfg834","data":{"id":"hags732-dsf-sdr32a","from":"sbtestinguser","text":"@testinguser hi","thread":{"id":"somethreadid","name":"some thread title"},"createTime":1457003330852,"room":{"id":"scrollback","name":"Scrollback"}}}
	}
	</gcm>
	</message>
	`;

	t.is(stanza, result);
});
