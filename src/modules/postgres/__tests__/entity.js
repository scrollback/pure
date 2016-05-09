/* eslint-env jest */

jest.autoMockOff();

console.log('Starting');

const entity = require('../entity'),
	Constants = require('../../../lib/Constants');



describe('Entity insert/update', () => {
	it('insert room', () => {
		expect(entity({
			id: '43b2bbd2-d041-4771-9907-7b77dd1fb187',
			name: 'bangalore',
			body: '',
			type: Constants.TYPE_ROOM,
			tags: [ Constants.TAG_ROOM_CITY ],
			meta: {},
			params: {},
			parents: [],
			creator: '',
			updater: '',
			createTime: 93784,
		})).toEqual({
			$: 'INSERT INTO "rooms" ( "id", "name", "body", "type", "tags", "meta", "params", "parents", "creator", "updater", "createtime", "terms" ) VALUES ( &{id}, &{name}, &{body}, &{type}, &{tags}, &{meta}, &{params}, &{parents}, &{creator}, &{updater}, &{createTime}, to_tsvector(&{locale}, &{name} || \' \' || &{body}) ) RETURNING *',
			body: '',
			createTime: 93784,
			creator: '',
			id: '43b2bbd2-d041-4771-9907-7b77dd1fb187',
			locale: 'english',
			meta: {},
			name: 'bangalore',
			params: {},
			parents: {},
			tags: { 0: 21 },
			type: 1,
			updater: '',
		});
	});
	it('update room', () => {
		expect(entity({
			id: '43b2bbd2-d041-4771-9907-7b77dd1fb187',
			name: 'bangalore',
			body: '',
			type: Constants.TYPE_ROOM,
			tags: [ Constants.TAG_ROOM_CITY ],
			meta: {},
			params: {},
			parents: [],
			creator: '',
			updater: '',
		})).toEqual({
			 $: 'UPDATE "rooms" SET "name" = &{name}, "body" = &{body}, "type" = &{type}, "tags" = &{tags}, "meta" = jsonop("meta", &{meta}, &{meta_op}), "params" = jsonop("params", &{params}, &{params_op}), "parents" = &{parents}, "creator" = &{creator}, "updater" = &{updater}, "terms" = to_tsvector(&{locale}, &{name} || \' \' || "body") WHERE "id" = &{id} RETURNING *',
			 body: '',
			 creator: '',
			 id: '43b2bbd2-d041-4771-9907-7b77dd1fb187',
			 locale: 'english',
			 meta: {},
			 meta_op: {},
			 name: 'bangalore',
			 params: {},
			 params_op: {},
			 parents: {},
			 tags: { 0: 21 },
			 type: 1,
			 updater: '',
		});
	});
});
