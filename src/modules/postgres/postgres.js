import { bus, cache, config } from '../../core-server';
import Counter from '../../lib/counter';
import * as PgEntity from './entity/entity';
import jsonop from 'jsonop';
import Know from '../../submodules/know/lib/Cache';
import * as pg from '../../lib/pg';
import presenceHandler from './presence';
import queryHandler from './query';
import { TYPE_NOTE } from '../../lib/Constants';
import { TYPE_NAMES, RELATION_TYPES } from '../../lib/schema';
import * as Types from '../../models/models';
import winston from 'winston';
import packer from '../../lib/packer';
const channel = 'heyneighbor';

function getTypeFromId(id) {
	const _split = id.split('_');

	if (_split.length === 3) return 'rest';
	else if (_split.length === 2) return 'rel';
	else if (id.length >= 36) return 'item';
	else return 'user';
}

function broadcast (entity) {
	pg.notify(config.connStr, channel, packer.encode(entity));
}

function onRangeQuery(key, range, err, r) {
	if (err) {
		winston.error(err);
		return;
	}

	const results = r.map(e => {
		const props = Object.keys(e), propsCount = props.length;
		let prop;

		props.forEach(name => {
			if (e[name]) {
				e[name] = new Types[name](e[name]);
				prop = name;
			}
		});

		if (propsCount > 1) return e;
		else return e[prop];
	});

	const orderedResult = new Know.OrderedArray(cache.arrayOrder(cache.keyToSlice(key)), results);
	const madeRange = Know.RangeArray.makeRange(range);
	const newRange = cache.countedToBounded(madeRange, orderedResult);
	cache.put({
		knowledge: { [key]: newRange },
		indexes: { [key]: orderedResult },
	});
}

function onEntityQuery(ids, err, r) {
	if (err) {
		winston.error(err.message);
		return;
	}

	const entities = {};

	r.forEach((row) => {
		const entity = new Types[TYPE_NAMES[row.type]](row);
		entities[entity.id] = entity;
	});

	const missingIds = ids.filter(id => !(id in entities));

	missingIds.forEach(id => { entities[id] = false; });

	cache.put({
		entities,
		source: 'postgres',
	});
}

cache.onChange((changes) => {
	if (changes.queries) {
		for (const key in changes.queries) {
			if (key === 'entities') {
				const ids = Object.keys(changes.queries.entities),
					typeToId = ids.reduce((map, id) => {
						map[getTypeFromId(id)].push(id);
						return map;
					}, {
						item: [],
						user: [],
						note: [],
						rel: [],
						rest: [],
					});

				typeToId.rest.forEach(id => {
					cache.put({ entities: { [id]: false } });
				});

				for (const i in typeToId) {
					// FIXME: Notes only for now
					if (i === 'rest' || i === 'note' || !typeToId[i].length) continue;

					pg.read(config.connStr,
						PgEntity.read[i](typeToId[i]),
						onEntityQuery.bind(null, typeToId[i])
					);
				}
			} else {
				for (const range of changes.queries[key]) {
					pg.read(
						config.connStr,
						queryHandler(cache.keyToSlice(key), range),
						onRangeQuery.bind(null, key, range)
					);
				}
			}
		}
	}
});

pg.listen(config.connStr, channel, (payload) => {
	if (!payload) return;
	const entity = packer.decode(payload);
	const isRel = (RELATION_TYPES.indexOf(entity.type) >= 0);
	if (!entity.id) {
		if (isRel) {
			entity.id = entity.user + '_' + entity.item;
		} else if (entity.type === TYPE_NOTE) {
			entity.id = entity.user + '_' + entity.event + '_' + entity.group;
		}
	}

	const change = { entities: { [entity.id]: entity } };
	bus.emit('postchange', change);
	cache.put(change);
});

bus.on('change', (changes, next) => {
	const counter = new Counter(), ids = [];
	let response = changes.response || {};
	if (!response.entities) response.entities = {};
	if (changes.source === 'postgres') {
		next();
		return;
	}

	if (changes.entities) {
		const sql = [];

		for (const id in changes.entities) {
			ids.push(id);
			sql.push(PgEntity.write(changes.entities[id]));
			if ('presence' in changes.entities[id] && changes.entities[id].createTime === changes.entities[id].updateTime) {
				ids.push(id);
				sql.push(presenceHandler(changes.entities[id]));
			}
		}

		winston.info('sql', sql);
		counter.inc();
		pg.write(config.connStr, sql, (err, results) => {
			let i = 0;

			if (err) {
				counter.err(err);
				return;
			}

			results.forEach(result => {
				winston.info(`Response for entity: ${ids[i]}`, JSON.stringify(result));

				if (result.rowCount && result.rows.length) {
					broadcast(changes.entities[result.rows[0].id]);
				}
				i++;
			});
			counter.dec();
		});
	}


	if (changes.queries) {
		const cb = (key, range, err, results) => {
				if (err) {
					response = jsonop.merge(response, { state: { error: err } }); }
				const newRange = cache.countedToBounded(range, results);
				response = jsonop.merge(response, {
					indexes: { [key]: results },
					knowledge: { [key]: newRange },
				});

				changes.response = response;
				counter.dec();
			},

			entityCallback = (id, err, result) => {
				if (err) { response = jsonop.merge(response, { state: { error: err } }); }
				if (result && result.id) {
					response.entities = response.entities ? response.entities : {};
					response.entities[result.id] = result;
				} else if (result === false) {
					response.entities[id] = false;
				}

				changes.response = response;

				counter.dec();
			};

		for (const key in changes.queries) {
			if (key === 'entities') {
				for (const entity in changes.queries[key]) {
					counter.inc();
					cache.getEntity(entity, entityCallback.bind(null, entity));
				}
			} else {
				for (const range of changes.queries[key]) {
					counter.inc();
					cache.query(key, range, cb.bind(null, key, range));
				}
			}
		}
	}

	counter.then(next);
}, 500);
