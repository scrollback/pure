/* eslint-env jest */

jest.autoMockOff();

let core = require('../../../core-server'),
	assert = require('assert'),
	Constants = require('../../../lib/Constants'),
	bus = core.bus,
	cache = core.cache;
// let count = require("../count");

describe('incriment count', () => {
	let count = require('../count');
	it('should add count+ to parents and user on new text', () => {
		bus.emit('change', {
			entities: {
				'sd23d-d23dasd-ad23-dawe': {
					id: 'sd23d-d23dasd-ad23-dawe',
					type: Constants.TYPE_TEXT,
					parents: [ [ 'sdf87sd-sdf6-xv6-xcvx7843d', 'sjfk34-sf9s-sdf43-amv-sdjfh34' ] ],
					body: 'this is a text message 1',
					tags: [ Constants.TAG_POST_STICKY ],
					createtime: Date.now(),
					creator: 'testinguser',
				},
			},
		}, (err, changes) => {
			console.log('changes', changes.entities['testinguser']);
			assert.deepEqual(changes.entities['sdf87sd-sdf6-xv6-xcvx7843d'], {
				 counts: { children: 1 },
				 id: 'sdf87sd-sdf6-xv6-xcvx7843d',
				 type: Constants.TYPE_THREAD,
			});
			assert.deepEqual(changes.entities['testinguser'], { counts: { texts: 1 }, id: 'testinguser' });
		});
	});

	it('should add count+ to parents and user on new thread', () => {
		bus.emit('change', {
			entities: {
				'sdf87sd-sdf6-xv6-xcvx7843d': {
					id: 'sdf87sd-sdf6-xv6-xcvx7843d',
					type: Constants.TYPE_THREAD,
					parents: [ [ 'sjfk34-sf9s-sdf43-amv-sdjfh34' ] ],
					body: 'this is a text message',
					name: 'this is a thread title',
					tags: [ Constants.TAG_POST_STICKY ],
					createtime: Date.now(),
					creator: 'testinguser',
				},
			},
		}, (err, changes) => {
			console.log(changes.entities);
			assert.deepEqual(changes.entities['sjfk34-sf9s-sdf43-amv-sdjfh34'], {
				counts: { children: 1 },
			 															id: 'sjfk34-sf9s-sdf43-amv-sdjfh34',
			 															type: 1,
			});
			assert.deepEqual(changes.entities['testinguser'], { counts: { threads: 1 }, id: 'testinguser' });
		});

	});

	it('should add count- to parents and user on delete text', () => {
		bus.emit('change', {
			entities: {
				'sd23d-d23dasd-ad23-dawe': {
					id: 'sd23d-d23dasd-ad23-dawe',
					type: Constants.TYPE_TEXT,
					parents: [ [ 'sdf87sd-sdf6-xv6-xcvx7843d', 'sjfk34-sf9s-sdf43-amv-sdjfh34' ] ],
					body: 'this is a text message 1',
					tags: [ Constants.TAG_POST_STICKY ],
					deletetime: Date.now(),
					creator: 'testinguser',
				},
			},
		}, (err, changes) => {
			console.log(changes.entities['testinguser']);
			assert.deepEqual(changes.entities['sdf87sd-sdf6-xv6-xcvx7843d'], {
				 counts: { children: -1 },
				 id: 'sdf87sd-sdf6-xv6-xcvx7843d',
				 type: Constants.TYPE_THREAD,
			});
			assert.deepEqual(changes.entities['testinguser'], { counts: { texts: -1 }, id: 'testinguser' });
		});
	});

	it('should add count- to parents and user on delete thread', () => {
		bus.emit('change', {
			entities: {
				'sdf87sd-sdf6-xv6-xcvx7843d': {
					id: 'sdf87sd-sdf6-xv6-xcvx7843d',
					type: Constants.TYPE_THREAD,
					parents: [ [ 'sjfk34-sf9s-sdf43-amv-sdjfh34' ] ],
					body: 'this is a text message',
					name: 'this is a thread title',
					tags: [ Constants.TAG_POST_STICKY ],
					deletetime: Date.now(),
					creator: 'testinguser',
				},
			},
		}, (err, changes) => {
			console.log(changes.entities);
			assert.deepEqual(changes.entities['sjfk34-sf9s-sdf43-amv-sdjfh34'], {
				counts: { children: -1 },
			 															id: 'sjfk34-sf9s-sdf43-amv-sdjfh34',
			 															type: 1,
			});
			assert.deepEqual(changes.entities['testinguser'], { counts: { threads: -1 }, id: 'testinguser' });
		});
	});

	it('should add follower count to related item', () => {
		bus.emit('change', {
			entities: {
				'testinguser_scrollback': {
					user: 'testinguser',
					item: 'sjfk34-sf9s-sdf43-amv-sdjfh34',
					type: Constants.TYPE_ROOMREL,
					role: Constants.ROLE_FOLLOWER,
				},
			},
		}, (err, changes) => {
			console.log(changes.entities);
			assert.deepEqual(changes.entities['sjfk34-sf9s-sdf43-amv-sdjfh34'], {
				id: 'sjfk34-sf9s-sdf43-amv-sdjfh34',
				type: Constants.TYPE_ROOM,
				counts: { follower: 1 },
			});
		});
	});

	it('should remove 1 follower count of related item', () => {
		cache.put({
			entities: {
				'testinguser_scrollback': {
					id: 'testinguser_scrollback',
					user: 'testinguser',
					item: 'sjfk34-sf9s-sdf43-amv-sdjfh34',
					type: Constants.TYPE_ROOMREL,
					role: Constants.ROLE_FOLLOWER,
				},
			},
		});

		bus.emit('change', {
			entities: {
				'testinguser_scrollback': {
					user: 'testinguser',
					item: 'sjfk34-sf9s-sdf43-amv-sdjfh34',
					type: Constants.TYPE_ROOMREL,
					role: Constants.ROLE_NONE,
				},
			},
		}, (err, changes) => {
			console.log(changes.entities);
			assert.deepEqual(changes.entities['sjfk34-sf9s-sdf43-amv-sdjfh34'], {
				id: 'sjfk34-sf9s-sdf43-amv-sdjfh34',
				type: Constants.TYPE_ROOM,
				counts: { follower: -1 },
			});
		});
	});

	it('should remove 1 follower count and add banned to related item', () => {
		cache.put({
			entities: {
				'testinguser_scrollback': {
					id: 'testinguser_scrollback',
					user: 'testinguser',
					item: 'sjfk34-sf9s-sdf43-amv-sdjfh34',
					type: Constants.TYPE_ROOMREL,
					role: Constants.ROLE_FOLLOWER,
				},
			},
		});

		bus.emit('change', {
			entities: {
				'testinguser_scrollback': {
					user: 'testinguser',
					item: 'sjfk34-sf9s-sdf43-amv-sdjfh34',
					type: Constants.TYPE_ROOMREL,
					role: Constants.ROLE_BANNED,
				},
			},
		}, (err, changes) => {
			console.log(changes.entities);
			assert.deepEqual(changes.entities['sjfk34-sf9s-sdf43-amv-sdjfh34'], {
				id: 'sjfk34-sf9s-sdf43-amv-sdjfh34',
				type: Constants.TYPE_ROOM,
				counts: { follower: -1, banned: 1 },
			});
		});
	});

	it('should remove 1 banned count and add follower to related item', () => {
		cache.put({
			entities: {
				'testinguser_scrollback': {
					id: 'testinguser_scrollback',
					user: 'testinguser',
					item: 'sjfk34-sf9s-sdf43-amv-sdjfh34',
					type: Constants.TYPE_ROOMREL,
					role: Constants.ROLE_BANNED,
				},
			},
		});

		bus.emit('change', {
			entities: {
				'testinguser_scrollback': {
					user: 'testinguser',
					item: 'sjfk34-sf9s-sdf43-amv-sdjfh34',
					type: Constants.TYPE_ROOMREL,
					role: Constants.ROLE_FOLLOWER,
				},
			},
		}, (err, changes) => {
			console.log(changes.entities);
			assert.deepEqual(changes.entities['sjfk34-sf9s-sdf43-amv-sdjfh34'], {
				id: 'sjfk34-sf9s-sdf43-amv-sdjfh34',
				type: Constants.TYPE_ROOM,
				counts: { follower: 1, banned: -1 },
			});
		});
	});

});
