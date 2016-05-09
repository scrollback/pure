import * as pg from '../../lib/pg';
import { TABLES, RELATION_TYPES } from '../../lib/schema';

function wherePart(entity, isRel) {
	return pg.cat([
		'WHERE',
		entity.id && !isRel ? {
			$: '"id" = &{id}',
			id: entity.id,
		} : {
			$: '"user" = &{user} AND "item" = &{item}',
			user: entity.user,
			item: entity.item,
		},
	]);
}

function selectSubQuery(entity, isRel) {
	return pg.cat([
		'(SELECT max(value)::smallint',
		'FROM "' + TABLES[entity.type] + '",' +
		'jsonb_each_text("' + TABLES[entity.type] + '".resources) ',
		wherePart(entity, isRel),
		')',
	]);
}

export default function(entity) {
	const isRel = (RELATION_TYPES.indexOf(entity.type) >= 0);

	if (!entity.id && !isRel) return '';

	return pg.cat([
		'UPDATE "' + TABLES[entity.type] + '" SET ',
		'presence = ',
		selectSubQuery(entity, isRel),
		wherePart(entity, isRel),
	]);
}
