import test from 'ava';
import query from '../query';

test('bounds query', t => {
	t.deepEqual(query({
		type: 'room',
		join: { rel: 'room' },
		order: 'createTime',
		filter: {
			room: {
				parents_cts: [ 'asdf' ]
			}
		},
	}, [ 764, 974 ]), {
		$: 'SELECT  row_to_json("rooms".*)::jsonb as "room",row_to_json("rels".*)::jsonb as "rel" FROM ( SELECT  * FROM "rooms" WHERE "parents" @> &{parents_cts} AND "createtime" <= &{createTime_lte} AND "createtime" >= &{createTime_gte} AND "rooms".deletetime IS NULL ORDER BY "rooms".createtime ASC LIMIT 256 ) as  rooms LEFT OUTER JOIN ( SELECT  * FROM "rels"   ) as  rels ON "rels"."room" = "rooms"."id"  ORDER BY "rooms".createtime ASC LIMIT 256',
		createTime_gte: 764,
		createTime_lte: 974,
		parents_cts: [ 'asdf' ]
	});
});

test('before/after query', (t) => {
	t.deepEqual(query({
		type: 'room',
		join: { rel: 'room' },
		order: 'createTime',
		filter: {
			room: {
				parents_cts: [ 'asdf' ]
			},
			rel: {
				role_gt: 'none'
			}
		},
	}, [ 764, 0, 25 ]), {
		$: 'SELECT  row_to_json("rooms".*)::jsonb as "room",row_to_json("rels".*)::jsonb as "rel" FROM ( SELECT  * FROM "rooms" WHERE "parents" @> &{parents_cts} AND "rooms".deletetime IS NULL ORDER BY "rooms".createtime ASC LIMIT 25 ) as  rooms LEFT OUTER JOIN ( SELECT  * FROM "rels" WHERE "role" > &{role_gt}  ) as  rels ON "rels"."room" = "rooms"."id"  ORDER BY "rooms".createtime ASC LIMIT 25',
		parents_cts: [ 'asdf' ],
 		role_gt: 'none'
	});
});

test('Should handle column name conflicts', (t) => {
	t.deepEqual(query({
		type: 'room',
		join: { rel: 'room' },
		order: 'createTime',
		filter: {
			room: {
				parents_cts: [ 'asdf' ]
			},
			rel: {
				roles_gt: 'none',
				user: 'harish'
			}
		}
	}, [ 764, 0, 25 ]), {
		$: 'SELECT  row_to_json("rooms".*)::jsonb as "room",row_to_json("rels".*)::jsonb as "rel" FROM ( SELECT  * FROM "rooms" WHERE "parents" @> &{parents_cts} AND "rooms".deletetime IS NULL ORDER BY "rooms".createtime ASC LIMIT 25 ) as  rooms LEFT OUTER JOIN ( SELECT  * FROM "rels" WHERE "roles" > &{roles_gt} AND "user" = &{user}  ) as  rels ON "rels"."room" = "rooms"."id"  ORDER BY "rooms".createtime ASC LIMIT 25',
		parents_cts: [ 'asdf' ],
		roles_gt: 'none',
		user: 'harish'
	});
});
