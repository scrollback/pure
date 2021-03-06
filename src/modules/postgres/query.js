import * as pg from '../../lib/pg';
import { TABLES, TYPES } from '../../lib/schema';

const MAX_LIMIT = 256;

const operators = {
	gt: '>',
	lt: '<',
	in: 'IN',
	neq: '<>',
	gte: '>=',
	lte: '<=',
	cts: '@>',
	ctd: '<@',
	pref: 'like',
	olp: '&&',
	first: '[1] = '
};

function getPropOp(prop) {
	const i = prop.lastIndexOf('_');

	if (i > 0) {
		return [ prop.substr(i + 1, prop.length), prop.substr(0, i) ];
	} else {
		return '';
	}
}

function wherePart (f) {
	const sql = [];
	const filter = Object.create(f.filter);

	for (const prop in filter) {
		 if (f.join && prop in f.join) continue;
		const opName = getPropOp(prop);
		const op = opName[0];
		let parts, type, name = opName[1];

		if (name) {
			parts = name.split('.');
			if (parts.length === 2) {
				type = parts[0];
				name = parts[1];
			} else {
				name = parts[0];
			}
		}

		let tableName = type ? TABLES[TYPES[type]] + '.' : '';

		if (Number.POSITIVE_INFINITY === filter[prop] || Number.NEGATIVE_INFINITY === filter[prop]) {
			continue;
		}

		switch (op) {
		case 'pref':
			filter[prop] = filter[prop].toLowerCase() + '%';
			sql.push(`lower(${tableName}"${name.toLowerCase()}") ${operators[op]} &{${prop}}`);
			break;
		case 'gt':
		case 'lt':
		case 'neq':
		case 'gte':
		case 'lte':
		case 'in':
		case 'cts':
		case 'olp':
		case 'ctd':
		case 'first':
			sql.push(`${tableName}"${name.toLowerCase()}" ${operators[op]} &{${prop}}`);
			break;
		default:
			parts = prop.split('.');
			if (parts.length === 2) {
				type = parts[0];
				name = parts[1];
			} else {
				name = parts[0];
			}

			tableName = type ? TABLES[TYPES[type]] + '.' : '';
			sql.push(`${tableName}"${prop.toLowerCase()}" = &{${prop}}`);
		}
	}

	switch (TABLES[TYPES[f.type]]) {
	case 'items':
	case 'rooms':
	case 'texts':
	case 'threads':
	case 'topics':
	case 'privs':
	case 'users':
	case 'notes':
		sql.push(`"${TABLES[TYPES[f.type]]}".deletetime IS NULL`);
	}
	if (sql.length) filter.$ = 'WHERE ' + sql.join(' AND ');
	else filter.$ = '';
	return filter;
}

function fromPart (slice, toJson, l) {
	const fields = [], joins = [], toJoin = [];
	if (slice.join) {
		toJoin.push(slice.type);
		for (const type in slice.join) toJoin.push(type);

		for (const type of toJoin) {
			let limit;
			const subSlice = {
				type,
				filter: {
					...(slice.filter[type] || {})
				},
			};

			if (type === slice.type) {
				subSlice.order = slice.order;
				limit = l;
			}

			const subQuery = simpleQuery(subSlice, false, limit); // eslint-disable-line no-use-before-define
			fields.push('row_to_json("' + TABLES[TYPES[type]] + '".*)::jsonb as "' + type + '"');
			if (joins.length > 0) {
				joins.push('LEFT OUTER JOIN');
			}
			joins.push('(', subQuery, ') as ', TABLES[TYPES[type]]);
		}
		joins.push('ON');
		for (const type in slice.join) {
			joins.push(
				'"' + TABLES[TYPES[type]] + '"."' + slice.join[type] + '" = "' +
				TABLES[TYPES[slice.type]] + '"."id"'
			);
		}
	} else {
		if (toJson) {
			fields.push('row_to_json("' + TABLES[TYPES[slice.type]] + '".*)::jsonb as "' + slice.type + '"');
		} else {
			fields.push('*');
		}
		joins.push('"' + TABLES[TYPES[slice.type]] + '"');
	}


	if (slice.link) {
		for (const type in slice.link) {
			joins.push(
				'LEFT OUTER JOIN "' + TABLES[TYPES[type]] + '" ON "' +
				TABLES[TYPES[slice.type]] + '"."' + slice.link[type] + '" = "' +
				TABLES[TYPES[type]] + '"."id"'
			);

			fields.push('row_to_json("' + TABLES[TYPES[type]] + '".*)::jsonb as "' + type + '"');
		}
	}

	return pg.cat([ 'SELECT ', pg.cat(fields, ','), 'FROM', pg.cat(joins, ' ') ], ' ');
}

// get better function name.
function wherePartForSegmentedFilters(f) {
	const sql = [];
	const filter = Object.create(f.filter);

	for (const segment in f.filter) {
		for (const prop in filter[segment]) {
			if (f.join && segment in f.join) continue;
			const opName = getPropOp(prop);
			const op = opName[0];
			const name = opName[1];

			let tableName = TABLES[TYPES[segment]];

			if (Number.POSITIVE_INFINITY === filter[segment][prop] || Number.NEGATIVE_INFINITY === filter[segment][prop]) {
				continue;
			}

			const filterPlaceHolder = segment + '.' + prop;
			filter[filterPlaceHolder] = filter[segment][prop];

			switch (op) {
			case 'pref':
				filter[prop] = filter[prop].toLowerCase() + '%';
				sql.push(`lower(${tableName}"${name.toLowerCase()}") ${operators[op]} &{${filterPlaceHolder.toLowerCase()}}`);
				break;
			case 'gt':
			case 'lt':
			case 'neq':
			case 'gte':
			case 'lte':
			case 'in':
			case 'cts':
			case 'olp':
			case 'ctd':
				sql.push(`${tableName}."${name.toLowerCase()}" ${operators[op]} &{${filterPlaceHolder.toLowerCase()}}`);
				break;
			default:
				tableName = TABLES[TYPES[segment]];
				sql.push(`${tableName}."${prop}" = &{${filterPlaceHolder.toLowerCase()}}`);
			}
		}
	}

	filter.$ = 'WHERE ' + sql.join(' AND ');
	return filter;
}

function orderPart(type, order, limit) {
	const parts = order.split('.');
	const field = (parts.length === 2) ? parts[1] : parts[0];

	if (limit < 0) {
		return `ORDER BY "${TABLES[TYPES[type]]}".${field.toLowerCase()} DESC LIMIT ${-limit}`;
	} else {
		return `ORDER BY "${TABLES[TYPES[type]]}".${field.toLowerCase()} ASC LIMIT ${limit}`;
	}
}

function simpleQuery(slice, toJson, limit) {
	return pg.cat([
		(slice.link || slice.join) ? fromPart(slice, toJson, limit) : fromPart(slice, toJson),
		(slice.link || slice.join) ? (
			slice.link ? wherePartForSegmentedFilters(slice): ''
		) : wherePart(slice),
		slice.order ? orderPart(slice.type, slice.order, limit) : '',
	], ' ');
}

function boundQuery (slice, start, end) {
	if (slice.link || slice.join) {
		if (!slice.filter[slice.type]) slice.filter[slice.type] = {};
		slice.filter[slice.type][slice.order + '_lte'] = end;
		slice.filter[slice.type][slice.order + '_gte'] = start;
	} else {
		slice.filter[slice.order + '_lte'] = end;
		slice.filter[slice.order + '_gte'] = start;
	}
	const query = simpleQuery(slice, true, MAX_LIMIT);
	if (slice.link || slice.join) {
		delete slice.filter[slice.type][slice.order + '_gte'];
		delete slice.filter[slice.type][slice.order + '_lte'];
	} else {
		delete slice.filter[slice.order + '_gte'];
		delete slice.filter[slice.order + '_lte'];
	}

	return query;
}

function beforeQuery (slice, start, before, exclude) {
	const key = slice.order + (exclude ? '_lt' : '_lte'),
		value = start;
	let query;

	if (slice.link || slice.join) {
		slice.filter[slice.type] = slice.filter[slice.type] || {};
		slice.filter[slice.type][key] = value;
		query = simpleQuery(slice, true, Math.max(-MAX_LIMIT, -before));
		delete slice.filter[slice.type][key];
	} else {
		slice.filter[slice.order + (exclude ? '_lt' : '_lte')] = start;
		query = simpleQuery(slice, true, Math.max(-MAX_LIMIT, -before));
		delete slice.filter[slice.order + (exclude ? '_lt' : '_lte')];
	}

	return pg.cat([
		'SELECT * FROM (',
		query,
		{
			$: `) r ORDER BY ${slice.type.toLowerCase()}->&{order} ASC`,
			order: slice.order.toLowerCase(),
		},

	], ' ');
}

function afterQuery (slice, start, after, exclude) {
	if (!slice.filter) slice.filter = {};
	slice.filter[slice.order + (exclude ? '_gt' : '_gte')] = start;
	const query = simpleQuery(slice, true, Math.min(MAX_LIMIT, after));

	delete slice.filter[slice.order + (exclude ? '_gt' : '_gte')];

	return query;
}

export default function s(slice, range) {
	let query;
	if (slice.order) {
		if (range.length === 2) {
			query = boundQuery(slice, range[0], range[1]);
		} else {
			if (range[1] > 0 && range[2] > 0) {
				query = pg.cat([
					'(',
					beforeQuery(slice, range[0], range[1], true),
					')',
					'UNION ALL',
					'(',
					afterQuery(slice, range[0], range[2]),
					')',
				], ' ');
			} else if (range[1] > 0) {
				query = beforeQuery(slice, range[0], range[1]);
			} else if (range[2] > 0) {
				query = afterQuery(slice, range[0], range[2]);
			}
		}
	} else {
		query = simpleQuery(slice, true, MAX_LIMIT);
	}
	return query;
}
