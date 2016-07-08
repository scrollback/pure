import test from 'ava';
import {
	TYPE_NOTE,
	TYPE_TEXTREL,
	NOTE_MENTION,
	ROLE_MENTIONED,
} from '../../../lib/Constants';
import {
	isMentioned,
	createNote,
	getRolesFromChanges,
} from '../note';

test('should detect if relation is a mention', t => {
	t.plan(4);
	t.false(isMentioned({}));
	t.false(isMentioned({
		roles: [ ROLE_MENTIONED ],
	}));
	t.false(isMentioned({
		type: TYPE_TEXTREL,
	}));
	t.true(isMentioned({
		type: TYPE_TEXTREL,
		roles: [ ROLE_MENTIONED ],
	}));
});

test('should get roles from changes', t => {
	t.plan(1);

	t.deepEqual(getRolesFromChanges({
		entities: {
			someid_anotherid: {
				item: 'someid',
				type: TYPE_TEXTREL,
				roles: [ ROLE_MENTIONED ],
			},
			someid: {
				id: 'someid',
				creator: 'john',
				body: 'The answer is 42',
			},
		},
	}), [
		{
			type: ROLE_MENTIONED,
			item: {
				id: 'someid',
				creator: 'john',
				body: 'The answer is 42',
			},
			relation: {
				item: 'someid',
				type: TYPE_TEXTREL,
				roles: [ ROLE_MENTIONED ],
			},
		},
	]);
});

test('should create mention', t => {
	t.plan(1);

	const time = Date.now();

	t.deepEqual(createNote(
		{ user: 'jane' },
		{ id: 'abcde', creator: 'john', body: 'The answer is 42' },
		{
			room: { id: 'efghi', name: 'Hell bent' },
			thread: { id: 'ijklm', name: 'The little mermaid' },
		},
		time
	), {
		count: 1,
		data: {
			id: 'abcde',
			creator: 'john',
			picture: 'http://localhost/i/picture?user=john&size=128',
			room: {
				id: 'efghi',
				name: 'Hell bent',
			},
			thread: {
				id: 'ijklm',
				name: 'The little mermaid',
			},
			link: 'http://localhost/efghi/ijklm/',
			title: 'New mention in Hell bent',
			body: 'The answer is 42',
		},
		event: NOTE_MENTION,
		createTime: time,
		updateTime: time,
		group: 'ijklm',
		score: 50,
		type: TYPE_NOTE,
		user: 'jane',
	});
});
