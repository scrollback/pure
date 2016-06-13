import test from 'ava';
import { transformThreads } from '../DiscussionsContainer';
import {
	TYPE_THREAD,
	TYPE_THREADREL,
	TAG_POST_HIDDEN,
	TAG_USER_ADMIN,
} from '../../../../lib/Constants';

test('should filter out hidden threads', t => {
	const threads = [
		{
			thread: { id: 1, type: TYPE_THREAD, body: 'hey', tags: [ TAG_POST_HIDDEN ], creator: 'jane' },
			threadrel: { type: TYPE_THREADREL, item: 1 },
		},
		{
			thread: { id: 2, type: TYPE_THREAD, body: 'ho', creator: 'jacob' },
			threadrel: { type: TYPE_THREADREL, item: 2 },
		},
		{
			thread: { id: 3, type: TYPE_THREAD, body: 'it', tags: [ TAG_POST_HIDDEN ], creator: 'jace' },
			threadrel: { type: 'loading', createTime: 1465802862053 },
		},
	];
	const me = { id: 'john' };
	const result = [
		{
			thread: { id: 2, type: TYPE_THREAD, body: 'ho', creator: 'jacob' },
			threadrel: { type: TYPE_THREADREL, item: 2 },
		},
	];

	t.deepEqual(transformThreads(threads, me), result);
});

test('should not filter out hidden threads from self', t => {
	const threads = [
		{
			thread: { id: 3, type: TYPE_THREAD, body: 'it', tags: [ TAG_POST_HIDDEN ], creator: 'jace' },
			threadrel: { type: 'loading', createTime: 1465802862053 },
		},
	];
	const me = { id: 'jace' };
	const result = [
		{
			thread: { id: 3, type: TYPE_THREAD, body: 'it', tags: [ TAG_POST_HIDDEN ], creator: 'jace' },
			threadrel: { type: 'loading', createTime: 1465802862053 },
		},
	];

	t.deepEqual(transformThreads(threads, me), result);
});

test('should not filter out hidden threads for admins', t => {
	const threads = [
		{
			thread: { id: 0, type: 'loading', createTime: 1465802862050 },
			threadrel: { type: 'loading', createTime: 1465802862050 },
		},
		{
			thread: { id: 1, type: TYPE_THREAD, body: 'hey', tags: [ TAG_POST_HIDDEN ], creator: 'jane' },
			threadrel: { type: TYPE_THREADREL, item: 1 },
		},
		{
			thread: { id: 2, type: TYPE_THREAD, body: 'ho', creator: 'jacob' },
			threadrel: { type: TYPE_THREADREL, item: 2 },
		},
		{
			thread: { id: 3, type: 'loading', createTime: 1465802862051 },
			threadrel: null,
		},
		{
			thread: { id: 4, type: TYPE_THREAD, body: 'let', creator: 'john' },
			threadrel: null,
		},
		{
			thread: { id: 5, type: TYPE_THREAD, body: 'it', tags: [ TAG_POST_HIDDEN ], creator: 'jace' },
			threadrel: { type: 'loading', createTime: 1465802862053 },
		},
		{
			thread: { id: 6, type: TYPE_THREAD, body: 'go', tags: [ TAG_POST_HIDDEN ], creator: 'john' },
			threadrel: { type: TYPE_THREADREL, item: 6 },
		},
	];
	const me = { id: 'jace', tags: [ TAG_USER_ADMIN ] };

	t.deepEqual(transformThreads(threads, me), threads);
});
