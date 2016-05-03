import test from 'ava';
import { convertURLToRoute } from '../../Route';

test('should throw error on invalid url', t => {
	t.throws(() => {
		convertURLToRoute(null);
	}, 'Invalid URL given');
});

test('should ignore protocol and host', t => {
	const result = {
		name: 'room',
		props: {
			room: 'someroom',
		},
	};

	t.deepEqual(result, convertURLToRoute('https://belong.chat/someroom/all/all-messages'));
	t.deepEqual(result, convertURLToRoute('http://localhost:7528/someroom/all/all-messages'));
	t.deepEqual(result, convertURLToRoute('//localhost:7528/someroom/all/all-messages'));
	t.deepEqual(result, convertURLToRoute('/someroom/all/all-messages'));
	t.deepEqual(result, convertURLToRoute('someroom/all/all-messages'));
});

test('should parse url with /me', t => {
	t.deepEqual({
		name: 'home',
	}, convertURLToRoute('/me'));
});

test('should parse url with /roomname', t => {
	t.deepEqual({
		name: 'room',
		props: {
			room: 'someroom',
		},
	}, convertURLToRoute('/someroom'));
});

test('should parse url with incorrect case /RoomName', t => {
	t.deepEqual({
		name: 'room',
		props: {
			room: 'someroom',
		},
	}, convertURLToRoute('/SomeRoom'));
});

test('should parse url with /roomname/all', t => {
	t.deepEqual({
		name: 'room',
		props: {
			room: 'someroom',
		},
	}, convertURLToRoute('/someroom/all'));
});

test('should parse url with /roomname/all/all-messages', t => {
	t.deepEqual({
		name: 'room',
		props: {
			room: 'someroom',
		},
	}, convertURLToRoute('/someroom/all/all-messages'));
});

test('should parse url with /roomname/threadid', t => {
	t.deepEqual({
		name: 'chat',
		props: {
			room: 'someroom',
			thread: 'abc456def',
		},
	}, convertURLToRoute('/someroom/abc456def'));
});

test('should parse url with /roomname/threadid/some-thread-title', t => {
	t.deepEqual({
		name: 'chat',
		props: {
			room: 'someroom',
			thread: 'abc456def'
		}
	}, convertURLToRoute('/someroom/abc456def/awesome-thread-is-this'));
});

test('should parse url with /roomname?time=1214340045721', t => {
	t.deepEqual({
		name: 'room',
		props: {
			room: 'someroom',
			time: 1214340045721
		}
	}, convertURLToRoute('/someroom?time=1214340045721'));
});

test('should parse url with /roomname/all/all-messages?time=1214340045721', t => {
	t.deepEqual({
		name: 'room',
		props: {
			room: 'someroom',
			time: 1214340045721
		}
	}, convertURLToRoute('/someroom/all/all-messages?time=1214340045721'));
});

test('should parse url with /roomname/threadid?time=1214340045721', t => {
	t.deepEqual({
		name: 'chat',
		props: {
			room: 'someroom',
			thread: 'abc456def',
			time: 1214340045721
		}
	}, convertURLToRoute('/someroom/abc456def?time=1214340045721'));
});

test('should parse url with /roomname/threadid/some-thread-title?t=1214340045721', t => {
	t.deepEqual({
		name: 'chat',
		props: {
			room: 'someroom',
			thread: 'abc456def',
			time: 1214340045721
		}
	}, convertURLToRoute('/someroom/abc456def/awesome-thread-is-this?time=1214340045721'));
});

test('should parse url when room is invalid', t => {
	const result = {
		name: 'home',
	};

	t.deepEqual(result, convertURLToRoute('/b'));
	t.deepEqual(result, convertURLToRoute('/um'));
	t.deepEqual(result, convertURLToRoute('/nm/abc456def/such-thread/?time=1214340045721'));
});

test('should parse url with /:room?room=roomname', t => {
	t.deepEqual({
		name: 'room',
		props: {
			room: 'someroom'
		}
	}, convertURLToRoute('/:room?room=someroom'));
});

test('should parse url with /:chat/?room=roomname&thread=threadid', t => {
	t.deepEqual({
		name: 'chat',
		props: {
			room: 'someroom',
			thread: 'abc456def'
		}
	}, convertURLToRoute('/:chat/?room=someroom&thread=abc456def'));
});

test('should parse url with /:notes', t => {
	t.deepEqual({
		name: 'notes',
		props: {}
	}, convertURLToRoute('/:notes'));
});

test('should parse url with /:account/', t => {
	t.deepEqual({
		name: 'account',
		props: {}
	}, convertURLToRoute('/:account/'));
});
