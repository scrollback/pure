import pg from 'pg';
import logger from 'winston';
import events from 'events';
import uid from './uid-server';
import BigInteger from 'big-integer';
import packer from './packer';

	// Variables for tracking and rolling back incomplete queries on shut down
const runningQueries = {},
	EventEmitter = events.EventEmitter;

let shuttingDown = false;

function hash(q) {
	const s = new Buffer(q).toString('hex');
	let h = new BigInteger(s.substring(0, 15), 16); // 60 bit
	let index = 15;

	while (index < s.length) {
		const nbi = new BigInteger(s.substring(index, index + 15), 16);

		index += 15;
		h = h.xor(nbi);
	}
	return h.toString();
}

function lock (s) {
	if (!s) throw new Error('lock variable is not defined');
	return {
		$: 'SELECT pg_advisory_xact_lock(${hash})',
		hash: hash(s),
	};
}

export function cat (parts, delim) {
	delim = delim || ' '; // eslint-disable-line no-param-reassign

	const q = { $: [] };

	parts.forEach((part) => {
		let paramName, suffix;

		if (typeof part === 'string') {
			q.$.push(part);
			return;
		}

		function substitute (match, left, mid, right) {
			return left + (mid === paramName ? paramName + '_' + suffix : mid) +
				right;
		}

		for (paramName in part) {
			if (paramName === '$') { continue; }
			if (paramName in q && part[paramName] !== q[paramName]) {
				suffix = 1;
				while ((paramName + '_' + suffix) in q) { suffix++; }

				part.$ = part.$.replace(/(&\{|\()([^\}\)]+)(\}|\))/g, substitute);
				q[paramName + '_' + suffix] = part[paramName];
			} else {
				q[paramName] = part[paramName];
			}
		}
		q.$.push(part.$);
	});

	q.$ = q.$.join(delim);

	return q;
}

export function nameValues (record, delim) {
	const parts = [];

	for (const column in record) {
		const part = { $: '"' + column + '"=&{' + column + '}' };

		part[column] = record[column];
		parts.push(part);
	}

	return cat(parts, delim || ', ');
}

export function columns (record) {
	return Object.keys(record)
		.map((c) => { return '"' + c + '"'; })
		.join(', ');
}

export function values (record) {
	const cols = [], clause = {};
	let column;

	for (column in record) {
		cols.push('${' + column + '}');
		clause[column] = record[column];
	}

	clause.$ = cols.join(', ');
	return clause;
}

export function update (tableName, object) {
	return cat([
		'UPDATE "' + tableName + '" SET ',
		nameValues(object),
	], ' ');
}

export function insert (tableName, objs) {
	if (!objs) throw Error('CANT_INSERT_NOTHING');
	const objects = (!Array.isArray(objs)) ? [ objs ] : objs;

	const parts = [
		'INSERT INTO "' + tableName + '" (',
		columns(objects[0]),
		') VALUES',
	];

	parts.push('(', cat(objects.map((object) => {
		return values(object);
	}), '), ('), ')');

	return cat(parts, ' ');
}

export function upsert (tableName, insertObject, keyColumns) {
	const updateObject = {}, whereObject = {};
	let col;

	for (col in insertObject) {
		if (keyColumns.indexOf(col) < 0) {
			updateObject[col] = insertObject[col];
		} else {
			whereObject[col] = insertObject[col];
		}
	}

	return [
		lock(keyColumns.sort().map((column) => { return whereObject[column]; }).join(':')),
		cat([ update(tableName, updateObject), 'WHERE', nameValues(whereObject, ' AND ') ]),
		cat([
			'INSERT INTO "' + tableName + '" (',
			columns(insertObject),
			') SELECT ',
			values(insertObject),
			'WHERE NOT EXISTS (SELECT 1 FROM ' + tableName,
			'WHERE', nameValues(whereObject, ' AND '), ')',
		]),
	];
}

// --------------------------------------------------------------------

export function paramize (query) {
	const ixs = {}, vals = [];

	function getIndex(p, v) {
		if (!(p in ixs)) {
			vals.push(v);
			ixs[p] = vals.length - 1;
		}
		return ixs[p];
	}

	function paren(p, v, wrap) {
		if (typeof v === 'undefined') {
			throw Error('Parameter ' + p + ' is undefined');
		}

		if (Array.isArray(v)) {
			const r = (wrap ? '(' : '') +
				v.map((iv, ix) => { return paren(p + '-' + ix, iv, true); }).join(', ') +
				(wrap ? ')' : '');

			return r;
		} else {
			return '$' + (getIndex(p, v) + 1);
		}
	}

	if (!query.$) {
		logger.error('Invalid query, no $');
		throw Error('INVALID_QUERY');
	}

	const sql = query.$.replace(/&\{([^\})]+)\}/g, (m, p) => {
		return '$' + (getIndex(p, query[p]) + 1);
	}).replace(/&\(([^\)]+)\)/g, (m, p) => {
		return paren(p, query[p]);
	});

	logger.log(sql, vals);
	return { q: sql, v: vals };
}

export const read = function (connStr, query, cb) {
	const start = Date.now();

	logger.info('PgRead start', query);
	pg.connect(connStr, (error, client, done) => {
		if (error) {
			logger.error('Unable to connect to ' + connStr, error, query);
			done();
			return cb(error);
		}

		const qv = paramize(query);

		logger.log('Querying', qv);
		client.query(qv.q, qv.v, (queryErr, result) => {
			done();
			if (queryErr) {
				logger.error('Query error', queryErr, qv);
				return cb(queryErr);
			}
			logger.info('PgRead ', query, 'result', result.rows.length, ' rows in ', Date.now() - start, 'ms');
			return cb(null, result.rows);
		});

		return null;
	});
};

export const readStream = function (connStr, query) {
	const rstream = new EventEmitter();

	logger.info('PgReadStream ', query);
	pg.connect(connStr, (error, client, done) => {
		if (error) {
			logger.error('Unable to connect to ' + connStr, error, query);
			done();
			return rstream.emit('error', error);
		}

		const qv = paramize(query);

		logger.log('Querying', qv);
		const stream = client.query(qv.q, qv.v);

		stream.on('row', (row, result) => {
			rstream.emit('row', row, result);
		});
		stream.on('end', (result) => {
			done(); rstream.emit('end', result);
		});
		stream.on('error', (err) => {
			done(); rstream.emit('error', err);
		});
		return null;
	});

	return rstream;
};

function rollback(error, client, done) {
	client.query('ROLLBACK', (err) => {
		logger.error('Rollback', error, err);
		return done(error);
	});
}

export const write = function (connStr, queries, cb) {
	if (!queries || !queries.length) { return cb(null, []); }

	const start = Date.now();

	logger.log('PgWrite starting ', queries);
	pg.connect(connStr, (error, client, done) => {
		if (error) {
			logger.error('Unable to connect to ' + connStr, error, queries);
			done();
			return cb(error);
		}

		if (shuttingDown) {
			return cb(Error('ERR_SERVER_SHUTDOWN'));
		}

		const id = uid();

		runningQueries[id] = client;

		function callback(err, results) {

			delete runningQueries[id];
			cb(err, results);
			done();
		}

		client.query('BEGIN', (err) => {
			const results = [];

			if (err) rollback(err, client, callback);

			function run(i) {
				if (shuttingDown) { return cb(Error('ERR_SERVER_SHUTDOWN')); }
				if (i < queries.length) {
					const qv = paramize(queries[i]);

					logger.log('Querying', qv);
					client.query(qv.q, qv.v, (queryErr, result) => {
						results[i] = result;
						if (queryErr) {
							logger.log('Rollback:', qv.q, qv.v);
							rollback(queryErr, client, callback);
						} else {
							run(i + 1);
						}
					});
				} else {
					client.query('COMMIT', (commitErr) => {
						logger.info('PgWrite', queries, 'completed in ', Date.now() - start, 'ms');
						callback(commitErr, results);
					});
				}

				return null;
			}
			run(0);
		});

		return null;
	});
	return null;
};

export function listen (connStr, channel, callback) {
	pg.connect(connStr, (error, client, done) => {
		if (error) {
			logger.error('Unable to connect to ' + connStr, error);
			done();
			return callback(error);
		}
		client.on('notification', (data) => {
			logger.info('Heard Notification', data);
			try {
				callback(packer.decode(data.payload));
			} catch (e) {
				logger.info('Error decoding:', e.message);
			}
		});
		client.query('LISTEN ' + channel);
		return null;
	});
}

export function notify (connStr, channel, data, callback) {
	pg.connect(connStr, (error, client, done) => {
		if (error) {
			logger.error('Unable to connect to ' + connStr, error);
			done();
			return callback(error);
		}
		logger.info("PgNotify '" + JSON.stringify(data));
		client.query('SELECT pg_notify($1, $2)', [ channel, packer.encode(data) ]);

		return done();
	});
}

function onShutDownSignal() {
	shuttingDown = true;
	logger.info('Process killed, rolling back queries');

	let ct = 1;

	// This is intentionally 1, not zero, and the comparison happens after the decrement, not before.
	// This is a weird roundabout way of ensuring that the process exits even if there are no running queries.
	// Perhaps rewrite?
	function done() {
		ct--;
		if (ct === 0) {
			logger.info('Complete: shutting down now.');
			process.exit(0);
		}
	}
	for (const key in runningQueries) {
		if (runningQueries.hasOwnProperty(key)) {
			ct++;
			rollback(new Error('error: SIGINT/SIGTERM'), runningQueries[key], done);
		}
	}
	done();
}

process.on('SIGINT', onShutDownSignal);
process.on('SIGTERM', onShutDownSignal);
