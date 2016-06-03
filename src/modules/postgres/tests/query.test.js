import test from 'ava';
import query from '../query';

test('bounds query', t => {
	t.deepEqual(query({
		type: 'room',
		join: { rel: 'room' },
		order: 'createTime',
		filter: { parents_cts: [ 'asdf' ] },
	}, [ 764, 974 ]), {
		$: 'SELECT  row_to_json("rooms".*)::jsonb as "room",row_to_json("rels".*)::jsonb as "rel" FROM "rooms" LEFT OUTER JOIN "rels" ON "rels"."room" = "rooms"."id" WHERE "parents" @> &{parents_cts} AND "createtime" >= &{createTime_gte} AND "createtime" <= &{createTime_lte} AND "rooms".deletetime IS NULL ORDER BY "rooms".createtime ASC LIMIT 1024',
		createTime_gte: 764,
		createTime_lte: 974,
		parents_cts: [ 'asdf' ],
	});
});

test('before/after query', (t) => {
	t.deepEqual(query({
		type: 'room',
		join: { rel: 'room' },
		order: 'createTime',
		filter: { parents_cts: [ 'asdf' ], role_gt: 'none' },
	}, [ 764, 0, 25 ]), {
		$: 'SELECT  row_to_json("rooms".*)::jsonb as "room",row_to_json("rels".*)::jsonb as "rel" FROM "rooms" LEFT OUTER JOIN "rels" ON "rels"."room" = "rooms"."id" WHERE "parents" @> &{parents_cts} AND "role" > &{role_gt} AND "createtime" >= &{createTime_gte} AND "rooms".deletetime IS NULL ORDER BY "rooms".createtime ASC LIMIT 25',
		createTime_gte: 764,
		parents_cts: [ 'asdf' ],
		role_gt: 'none'
	});
});

test('Should handle column name conflicts', (t) => {
	t.deepEqual(query({
		type: 'room',
		join: { rel: 'room' },
		order: 'createTime',
		filter: { parents_cts: [ 'asdf' ], role_gt: 'none', 'rel.user': 'harsh' }
	}, [ 764, 0, 25 ]), {
		$: 'SELECT  row_to_json("rooms".*)::jsonb as "room",row_to_json("rels".*)::jsonb as "rel" FROM "rooms" LEFT OUTER JOIN "rels" ON "rels"."room" = "rooms"."id" WHERE "parents" @> &{parents_cts} AND "role" > &{role_gt} AND rels."rel.user" = &{rel.user} AND "createtime" >= &{createTime_gte} AND "rooms".deletetime IS NULL ORDER BY "rooms".createtime ASC LIMIT 25',
		createTime_gte: 764,
		parents_cts: [ 'asdf' ],
		'rel.user': 'harsh',
		role_gt: 'none'
	});
});
