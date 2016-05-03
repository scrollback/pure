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
			textId: 'hags732-dsf-sdr32a',
			from: 'sbtestinguser',
			text: '@testinguser hi',
			thread: 'some thread title',
			createTime: 1457003330852,
			room: 'scrollback'
		}
	};

	const id = uid();
	const stanza = createStanza(data, id);
	const result = `
	<message>
	<gcm xmlns="google:mobile:data">
	{
		"to": "/topics/user-testinguser",
		"message_id": "${id}",
		"data": {"user":"testinguser","event":1,"createTime":1457003330852,"updateTime":1457003330852,"type":40,"group":"shagf7-sdfhg834-dskfg834","data":{"textId":"hags732-dsf-sdr32a","from":"sbtestinguser","text":"@testinguser hi","thread":"some thread title","createTime":1457003330852,"room":"scrollback"}}
	}
	</gcm>
	</message>
	`;

	t.is(stanza, result);
});
