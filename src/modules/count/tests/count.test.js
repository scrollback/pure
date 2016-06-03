import { bus, cache } from '../../../core-server';
import * as Constants from '../../../lib/Constants';
import '../count';
import test from 'ava';
// let count = require("../count");

test.cb('should add count on room and user if thread created', t => {
	const time = Date.now();
	const changes = {
		entities: {
			'8efec7ef-6899-4548-8467-4b2cc2f9b76b': {
				id: '8efec7ef-6899-4548-8467-4b2cc2f9b76b',
				name: 'Thread title',
				body: 'Thread 1st text',
				type: Constants.TYPE_THREAD,
				parents: [ '52132a2b-b89f-41f4-b6f9-ce4244fa2a68' ],
				createTime: time,
				updateTime: time,
				creator: 'testinguser'
			}
		}
	};
	bus.emit('change', changes, (e, c) => {
		t.deepEqual(c.entities['52132a2b-b89f-41f4-b6f9-ce4244fa2a68'], {
			counts: { children: [ 1, '$add' ] },
			id: '52132a2b-b89f-41f4-b6f9-ce4244fa2a68',
			type: Constants.TYPE_ROOM
		});
		t.deepEqual(c.entities.testinguser, {
			id: 'testinguser',
			type: Constants.TYPE_USER,
			counts: { threads: [ 1, '$add' ] }
		});
		t.end();
	});
});

test.cb('should add count on thread and user if text created', t => {
	const time = Date.now();
	const changes = {
		entities: {
			'8efec7ef-6899-4548-8467-4b2cc2f9b76b': {
				id: '8efec7ef-6899-4548-8467-4b2cc2f9b76b',
				name: 'Thread title',
				body: 'Thread 1st text',
				type: Constants.TYPE_TEXT,
				parents: [ '52132a2b-b89f-41f4-b6f9-ce4244fa2a68' ],
				createTime: time,
				updateTime: time,
				creator: 'testinguser'
			}
		}
	};
	bus.emit('change', changes, (e, c) => {
		t.deepEqual(c.entities['52132a2b-b89f-41f4-b6f9-ce4244fa2a68'], {
			counts: { children: [ 1, '$add' ] },
			id: '52132a2b-b89f-41f4-b6f9-ce4244fa2a68',
			type: Constants.TYPE_THREAD
		});
		t.deepEqual(c.entities.testinguser, {
			id: 'testinguser',
			type: Constants.TYPE_USER,
			counts: { texts: [ 1, '$add' ] }
		});
		t.end();
	});
});

test.cb('should add count on item if room relation created', t => {
	const changes = {
		entities: {
			'user_8efec7ef-6899-4548-8467-4b2cc2f9b76b': {
				item: '8efec7ef-6899-4548-8467-4b2cc2f9b76b',
				user: 'user',
				type: Constants.TYPE_ROOMREL,
				roles: [ 1, 2, 3, 41, 42, 43 ]
			}
		}
	};
	cache.put({ entities: { 'user_8efec7ef-6899-4548-8467-4b2cc2f9b76b': {
		item: '8efec7ef-6899-4548-8467-4b2cc2f9b76b',
		user: 'user',
		type: Constants.TYPE_ROOMREL,
		roles: []
	} } });
	bus.emit('change', changes, (e, c) => {
		t.deepEqual(c.entities['8efec7ef-6899-4548-8467-4b2cc2f9b76b'], {
			counts: { visitor: [ 1, '$add' ],
     mentioned: [ 1, '$add' ],
     follower: [ 1, '$add' ],
     home: [ 1, '$add' ],
     work: [ 1, '$add' ],
     hometown: [ 1, '$add' ] },
			id: '8efec7ef-6899-4548-8467-4b2cc2f9b76b',
			type: 1
		});
		t.end();
	});

});

test.cb('should add count on item if thread relation created', t => {
	const changes = {
		entities: {
			'user_8efec7ef-6899-4548-8467-4b2cc2f9b76b': {
				item: '8efec7ef-6899-4548-8467-4b2cc2f9b76b',
				user: 'user',
				type: Constants.TYPE_THREADREL,
				roles: [ 1, 2, 3, 6, 31, 32, 33 ]
			}
		}
	};
	cache.put({ entities: { 'user_8efec7ef-6899-4548-8467-4b2cc2f9b76b': {
		item: '8efec7ef-6899-4548-8467-4b2cc2f9b76b',
		user: 'user',
		type: Constants.TYPE_THREADREL,
		roles: []
	} } });
	bus.emit('change', changes, (e, c) => {
		t.deepEqual(c.entities['8efec7ef-6899-4548-8467-4b2cc2f9b76b'], {
			counts: {
				visitor: [ 1, '$add' ],
				mentioned: [ 1, '$add' ],
				follower: [ 1, '$add' ],
				upvote: [ 1, '$add' ],
				flag: [ 1, '$add' ],
				mute: [ 1, '$add' ]
			},
			id: '8efec7ef-6899-4548-8467-4b2cc2f9b76b',
			type: 3
		});
		t.end();
	});

});

test.cb('should add count -1 on item if unfollow room', t => {
	const changes = {
		entities: {
			'user_8efec7ef-6899-4548-8467-4b2cc2f9b76b': {
				item: '8efec7ef-6899-4548-8467-4b2cc2f9b76b',
				user: 'user',
				type: Constants.TYPE_THREADREL,
				roles: []
			}
		}
	};
	cache.put({ entities: { 'user_8efec7ef-6899-4548-8467-4b2cc2f9b76b': {
		item: '8efec7ef-6899-4548-8467-4b2cc2f9b76b',
		user: 'user',
		type: Constants.TYPE_THREADREL,
		roles: [ 1, 2, 3, 6, 31, 32, 33 ]
	} } });
	bus.emit('change', changes, (e, c) => {
		t.deepEqual(c.entities['8efec7ef-6899-4548-8467-4b2cc2f9b76b'], {
			counts: {
				visitor: [ -1, '$add' ],
				mentioned: [ -1, '$add' ],
				follower: [ -1, '$add' ],
				upvote: [ -1, '$add' ],
				flag: [ -1, '$add' ],
				mute: [ -1, '$add' ]
			},
			id: '8efec7ef-6899-4548-8467-4b2cc2f9b76b',
			type: 3
		});
		t.end();
	});

});
