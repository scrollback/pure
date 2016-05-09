/* eslint: env jest */
'use strict';

jest.autoMockOff();

let { Constants, bus, cache } = require('../../../core-server');

require('../relation');
describe('create relation on reply to a thread', () => {
	bus.emit('change', {
		entities: {
			'jheg38-sdfh34-sdf7-sdfhg': {
				id: 'jheg38-sdfh34-sdf7-sdfhg',
				body: 'this is a text message',
				type: Constants.TYPE_TEXT,
				creator: 'testinguser',
				parents: [ [ 'ajhg8-236dsf8-dshg327-sdhg7' ] ],
			},
		},
	}, (err, changes) => {
		console.log(changes.entities['testinguser_ajhg8-236dsf8-dshg327-sdhg7']);
		expect(changes.entities['testinguser_ajhg8-236dsf8-dshg327-sdhg7']).toEqual({ user: 'testinguser', item: 'ajhg8-236dsf8-dshg327-sdhg7', type: 23, tags: undefined, role: undefined, roleTime: undefined, interest: undefined, resources: undefined, presence: undefined, presenceTime: undefined, message: undefined, admin: undefined, transitRole: undefined, transitType: undefined, expireTime: undefined,
		});
	});
});

describe('create relation if mention on a text(item not in entities)', () => {
	cache.put({
		entities: {
			'jheg38-sdfh34-sdf7-sdfhg': {
				id: 'jheg38-sdfh34-sdf7-sdfhg',
				body: '@testinguser hi',
				type: Constants.TYPE_TEXT,
				creator: 'sbtestinguser',
				parents:[ [ 'hsdgf834-sdhf384-sdfuh34' ] ],
			},
		},
	});
	bus.emit('change', {
		entities: {
			'testinguser_jheg38-sdfh34-sdf7-sdfhg': {
				user: 'testinguser',
				item: 'jheg38-sdfh34-sdf7-sdfhg',
				type: Constants.TYPE_TEXTREL,
				roles: [ Constants.ROLE_MENTIONED ],
			},
		},
	}, (err, changes) => {
		console.log(changes.entities['testinguser_hsdgf834-sdhf384-sdfuh34']);
		expect(changes.entities['testinguser_hsdgf834-sdhf384-sdfuh34']).toEqual({ user: 'testinguser', item: 'hsdgf834-sdhf384-sdfuh34', type: 23, tags: undefined, role: undefined, roleTime: undefined, interest: undefined, resources: undefined, presence: undefined, presenceTime: undefined, message: undefined, admin: undefined, transitRole: undefined, transitType: undefined, expireTime: undefined,
		});
	});
});


describe('create relation if mention on a text(item in entities)', () => {

	bus.emit('change', {
		entities: {
			'testinguser_jheg38-sdfh34-sdf7-sdfhg': {
				user: 'testinguser',
				item: 'jheg38-sdfh34-sdf7-sdfhg',
				type: Constants.TYPE_TEXTREL,
				roles: [ Constants.ROLE_MENTIONED ],
			},
			'jheg38-sdfh34-sdf7-sdfhg': {
				id: 'jheg38-sdfh34-sdf7-sdfhg',
				body: '@testinguser hi',
				type: Constants.TYPE_TEXT,
				creator: 'sbtestinguser',
				parents:[ [ 'hsdgf834-sdhf384-sdfuh34' ] ],
			},
		},
	}, (err, changes) => {
		console.log(changes.entities['testinguser_hsdgf834-sdhf384-sdfuh34']);
		expect(changes.entities['testinguser_hsdgf834-sdhf384-sdfuh34']).toEqual({ user: 'testinguser', item: 'hsdgf834-sdhf384-sdfuh34', type: 23, tags: undefined, role: undefined, roleTime: undefined, interest: undefined, resources: undefined, presence: undefined, presenceTime: undefined, message: undefined, admin: undefined, transitRole: undefined, transitType: undefined, expireTime: undefined,
		});
	});
});
