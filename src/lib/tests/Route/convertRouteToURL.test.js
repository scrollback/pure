import test from 'ava';
import { convertRouteToURL } from '../../Route';

test('should throw error on invalid state', t => {
	const route1 = 'somestring';
	const route2 = { hey: 'ho' };

	t.throws(() => {
		convertRouteToURL(route1);
	}, 'Invalid route given');

	t.throws(() => {
		convertRouteToURL(route2);
	}, 'Invalid route given');
});

test('should build url with home', t => {
	t.is('/p/home/', convertRouteToURL({
		name: 'home',
	}));
});

test('should build url with notes', t => {
	t.is('/p/notes?filter=unread', convertRouteToURL({
		name: 'notes',
		props: {
			filter: 'unread',
		},
	}));
});

test('should build url with room', t => {
	t.is('/someroom/', convertRouteToURL({
		name: 'room',
		props: {
			room: 'someroom',
		},
	}));
});

test('should build url with thread', t => {
	t.is('/someroom/abc456def/', convertRouteToURL({
		name: 'chat',
		props: {
			room: 'someroom',
			thread: 'abc456def',
		},
	}));
});

test('should build url when thread is not given', t => {
	t.is('/someroom/', convertRouteToURL({
		name: 'room',
		props: {
			room: 'someroom',
			thread: null,
		},
	}));
});

test('should build url when thread title is given', t => {
	t.is('/someroom/abc456def/such-awesome-much-thread-wow', convertRouteToURL({
		name: 'chat',
		props: {
			room: 'someroom',
			thread: 'abc456def',
			title: 'Such awesome. Much thread. Wow!',
		},
	}));
});
