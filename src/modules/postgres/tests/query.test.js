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
		$: 'SELECT  row_to_json("rooms".*)::jsonb as "room",row_to_json("rels".*)::jsonb as "rel" FROM "rooms" LEFT OUTER JOIN ( SELECT * from rels   ) as rels  ON "rels"."room" = "rooms"."id" WHERE rooms."parents" @> &{room.parents_cts} ORDER BY "rooms".createtime ASC LIMIT 1024',
		createTime_gte: 764,
		createTime_lte: 974,
		'room.parents_cts': [ 'asdf' ],
		room: {
			parents_cts: [ 'asdf' ]
		}
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
		$: 'SELECT  row_to_json("rooms".*)::jsonb as "room",row_to_json("rels".*)::jsonb as "rel" FROM "rooms" LEFT OUTER JOIN ( SELECT * from rels  WHERE "role" > &{role_gt} ) as rels  ON "rels"."room" = "rooms"."id" WHERE rooms."parents" @> &{room.parents_cts} ORDER BY "rooms".createtime ASC LIMIT 25',
		createTime_gte: 764,
		'room.parents_cts': [ 'asdf' ],
		role_gt: 'none',
		room: {
			parents_cts: [ 'asdf' ]
		},
		rel: {
			role_gt: 'none'
		}
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
		$: 'SELECT  row_to_json("rooms".*)::jsonb as "room",row_to_json("rels".*)::jsonb as "rel" FROM "rooms" LEFT OUTER JOIN ( SELECT * from rels  WHERE "roles" > &{roles_gt} AND "user" = &{user} ) as rels  ON "rels"."room" = "rooms"."id" WHERE rooms."parents" @> &{room.parents_cts} ORDER BY "rooms".createtime ASC LIMIT 25',
		roles_gt: 'none',
		user: 'harish',
		'room.parents_cts': [ 'asdf' ],
		room: {
			parents_cts: [ 'asdf' ]
		},
		rel: {
			roles_gt: 'none',
			user: 'harish'
		},
		createTime_gte: 764
	});
});
