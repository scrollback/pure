import * as pg from '../../../lib/pg';
import { TABLES, COLUMNS, RELATION_TYPES, ITEM_TYPES, TYPES } from '../../../lib/schema';
import * as Constants from '../../../lib/Constants';
import jsonop from 'jsonop';
import defaultOps from './../../../lib/defaultOps';

export default function (entity) {
	// TODO: add validation for type else this code crashes.

	const isRel = (RELATION_TYPES.indexOf(entity.type) >= 0),
		names = Object.keys(entity).filter(
			name => COLUMNS[entity.type].indexOf(name) >= 0 &&
			typeof entity[name] !== 'undefined'
		);

	const ops = jsonop(defaultOps, entity.__op__ || {});

	if (entity.type === Constants.TYPE_ROOM) {
		names.push('terms');
	}

	// Default properties that has to be set at all times.
	if (ITEM_TYPES.indexOf(entity.type) >= 0 || TYPES.TYPE_USER) {
		if (entity.create) names.push('createtime');
		names.push('updatetime');
	}

	names.splice(names.indexOf('type'), 1);
	if (entity.create) { // INSERT

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
						body: entity.body
					};
				case 'createtime':
				case 'updatetime':
					return {
						$: `&{${name}}`,
						[name]: Date.now()
					};
				default:
					return {
						$: `&{${name}}`,
						[name]: entity[name]
					};
				}
			}), ', '),
			{
				$: ') RETURNING &{id}::text as "id"',
				id: isRel ? entity.user + '_' + entity.item : entity.id
			}
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
						body: entity.body
					};
				case 'updatetime':
					return `${name} = ${Date.now()}`;
				case 'presence':
					return {
						$: 'presence = GREATEST(presence, &{presence}::smallint)',
						presence: entity.presence
					};
				case 'meta':
				case 'params':
				case 'data':
				case 'resources':
					return {
						$: `"${name}" = jsonop("${name}"::jsonb, &{${name}}::jsonb, &{${name}_op}::jsonb)`,
						[name]: entity[name],
						[name + '_op']: ops[name] || null
					};
				default:
					return {
						$: `"${name.toLowerCase()}" = &{${name}}`,
						[name]: entity[name]
					};
				}
			}).filter(sql => sql), ', '),

			'WHERE',
			entity.id && !isRel ? {
				$: '"id" = &{id}',
				id: entity.id
			} :
			isRel ? {
				$: '"user" = &{user} AND "item" = &{item}',
				user: entity.user,
				item: entity.item
			} :
			entity.user && entity.event && entity.group ? {
				$: '"user" = &{user} AND "event" = &{event}' +
					' AND "group" = &{group}',
				user: entity.user,
				event: entity.item,
				group: entity.group
			} : 'FALSE',
			{
				$: ' RETURNING &{id}::text as "id"',
				id: isRel ? entity.user + '_' + entity.item : entity.id
			}
		], ' ');
	}
}