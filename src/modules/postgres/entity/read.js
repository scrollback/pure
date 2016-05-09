import * as Constants from '../../../lib/Constants';
import * as pg from '../../../lib/pg';

const TYPE_SEGMENT = `case \
when tableoid = 'notes'::regclass then ${Constants.TYPE_NOTE} \
when tableoid = 'privs'::regclass then ${Constants.TYPE_PRIV} \
when tableoid = 'roomrels'::regclass then ${Constants.TYPE_ROOMREL} \
when tableoid = 'rooms'::regclass then ${Constants.TYPE_ROOM} \
when tableoid = 'textrels'::regclass then ${Constants.TYPE_TEXTREL} \
when tableoid = 'texts'::regclass then ${Constants.TYPE_TEXT} \
when tableoid = 'threadrels'::regclass then ${Constants.TYPE_THREADREL} \
when tableoid = 'threads'::regclass then ${Constants.TYPE_THREAD} \
when tableoid = 'topicrels'::regclass then ${Constants.TYPE_TOPICREL} \
when tableoid = 'topics'::regclass then ${Constants.TYPE_TOPIC} \
when tableoid = 'users'::regclass then ${Constants.TYPE_USER} \
end as type`;

export default {
	item,
	user,
	rel,
};

function item(ids) {
	return {
		$: `SELECT *, ${TYPE_SEGMENT} FROM items WHERE id IN (&(ids))`,
		ids,
	};
}

function user(ids) {
	return {
		$: `SELECT *, ${TYPE_SEGMENT} FROM users WHERE id IN (&(ids))`,
		ids,
	};
}
function rel(ids) {
	const q = [];

	ids.map(id => id.split('_')).forEach(([ u, i ]) => {
		q.push({
			$: `SELECT *, ${TYPE_SEGMENT} FROM rels WHERE "user" = &{user} AND "item" = &{item}`,
			item: i,
			user: u,
		});
	});

	return pg.cat(q, ' UNION ');
}
