import * as pg from '../../../lib/pg';
import { TABLES, COLUMNS, RELATION_TYPES } from '../../../lib/schema';
import * as Constants from '../../../lib/Constants';
import jsonop from 'jsonop';
import defaultOps from '../../../lib/defaultOps';

function shouldInsert(entity) {
	if (!('createTime' in entity)) return false;
	if (entity.createTime === entity.updateTime) return true;
	return false;
}

export default function (entity) {
	// TODO: add validation for type else this code crashes.

	const isRel = (RELATION_TYPES.indexOf(entity.type) >= 0), now = Date.now();

	if (entity.presence) entity.presenceTime = now;

	const names = Object.keys(entity).filter(
			name => COLUMNS[entity.type].indexOf(name) >= 0 &&
			typeof entity[name] !== 'undefined'
		);

	const ops = jsonop(defaultOps, entity.__op__ || {});

	if (entity.type === Constants.TYPE_ROOM) {
		names.push('terms');
	}

	names.splice(names.indexOf('type'), 1);

	if (shouldInsert(entity)) { // INSERT
		if (isRel) {
			if (!entity.roles) entity.roles = [];
		}

		return pg.cat([
			`INSERT INTO "${TABLES[entity.type]}" (`,
			'"' + names.map(name => name.toLowerCase()).join('", "') + '"',
			') VALUES (',
			pg.cat(names.map(name => {
				switch (name) {
				case 'terms':
					return {
						$: 'to_tsvector(&{locale}, &{name} || \' \' || &{body})',
						locale: 'english',
						name: entity.name,
						body: entity.body,
					};
				case 'roles':
					return {
						$: `&{${name}}`,
						[name]: entity[name] || [],
					};
				case 'createtime':
				case 'updatetime':
					return {
						$: `&{${name}}`,
						[name]: Date.now(),
					};
				case 'meta':
				case 'params':
				case 'data':
				case 'resources':
				case 'counts':
					return {
						$: `jsonop('{}'::jsonb, &{${name}}, '{}'::jsonb)`,
						[name]: entity[name],
					};
				default:
					return {
						$: `&{${name}}`,
						[name]: entity[name],
					};
				}
			}), ', '),
			{
				$: ') RETURNING &{id}::text as "id"',
				id: isRel ? entity.user + '_' + entity.item : entity.id,
			},
		], ' ');
	} else { // UPDATE
		return pg.cat([
			'UPDATE "' + TABLES[entity.type] + '" SET',
			pg.cat(names.map(name => {
				switch (name) {
				case 'id':
				case 'createTime':
					return false; // do not update this column.
				case 'terms':
					return {
						$: '"terms" = to_tsvector(&{locale}, ' +
							(entity.name ? '&{name}' : '"name"') +
							" || ' ' || " +
							(entity.body ? '&{body}' : '"body"') +
							')',
						locale: 'english',
						name: entity.name,
						body: entity.body,
					};
				case 'updatetime':
					return `${name} = ${Date.now()}`;
				case 'presence':
					return {
						$: 'presence = GREATEST(presence, &{presence}::smallint)',
						presence: entity.presence,
					};
				case 'counts':
					return {
						$: `"${name}" = jsonop("${name}"::jsonb, &{${name}}::jsonb, &{defaultOps}::jsonb)`,
						[name]: entity[name],
					};
				case 'meta':
				case 'params':
				case 'data':
				case 'resources':
					return {
						$: `"${name}" = jsonop("${name}"::jsonb, &{${name}}::jsonb, &{${name}_op}::jsonb)`,
						[name]: entity[name],
						[name + '_op']: ops[name] || null,
					};
				default:
					return {
						$: `"${name.toLowerCase()}" = &{${name}}`,
						[name]: entity[name],
					};
				}
			}).filter(sql => sql), ', '),

			'WHERE',
			entity.id && !isRel ? {
				$: '"id" = &{id}',
				id: entity.id,
			} :
			isRel ? {
				$: '"user" = &{user} AND "item" = &{item}',
				user: entity.user,
				item: entity.item,
			} :
			entity.user && entity.event && entity.group ? {
				$: '"user" = &{user} AND "event" = &{event}' +
					' AND "group" = &{group}',
				user: entity.user,
				event: entity.item,
				group: entity.group,
			} : 'FALSE',
			{
				$: ' RETURNING &{id}::text as "id"',
				id: isRel ? entity.user + '_' + entity.item : entity.id,
			},
		], ' ');
	}
}
