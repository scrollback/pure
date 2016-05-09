/* eslint-env jest */

jest.autoMockOff();

const query = require('../query');

describe('Query', () => {
	it('bounds query', () => {
		expect(query({
			type: 'room',
			join: { rel: 'room' },
			order: 'createTime',
			filter: { parents_cts: [ 'asdf' ] },
		}, [ 764, 974 ])).toEqual({
			$: 'SELECT  row_to_json("rooms.*") as "room",row_to_json("rels.*") as "rel" FROM "rooms" LEFT OUTER JOIN "rels" ON "rels"."room" = "rooms"."id" WHERE "parents" <& \'{&{firstParent}}\' AND "createTime" >= &{createTime_gte} AND "createTime" <= &{createTime_lte} ORDER BY "createTime" ASC LIMIT 1024',
			createTime_gte: 764,
			createTime_lte: 974,
			parents_cts: [ 'asdf' ],
		});
	});

	it('before/after query', () => {
		expect(query({
			type: 'room',
			join: { rel: 'room' },
			order: 'createTime',
			filter: { parents_cts: [ 'asdf' ], role_gt: 'none' },
		}, [ 764, 25, 25 ])).toEqual({
			$: 'SELECT * FROM ( SELECT  row_to_json("rooms.*") as "room",row_to_json("rels.*") as "rel" FROM "rooms" LEFT OUTER JOIN "rels" ON "rels"."room" = "rooms"."id" WHERE "parents" <& \'{&{firstParent}}\' AND "role" > &{roleGt} AND "createTime" < &{createTimeLt} ORDER BY "createTime" DESC LIMIT 25 ) r ORDER BY "&{type}"->\'&{order}\' ASC UNION ALL SELECT  row_to_json("rooms.*") as "room",row_to_json("rels.*") as "rel" FROM "rooms" LEFT OUTER JOIN "rels" ON "rels"."room" = "rooms"."id" WHERE "firstParent" = &{firstParent} AND "role" > &{role_gt} AND "createTime" >= &{createTime_gte} ORDER BY "createTime" ASC LIMIT 25',
			createTime_gte: 764,
			createTime_lt: 764,
			parents_cts: [ 'asdf' ],
			order: 'createTime',
			role_gt: 'none',
			type: 'room',
		});
	});
});
