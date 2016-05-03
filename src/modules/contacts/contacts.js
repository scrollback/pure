import route from 'koa-route';
import { bus, config } from '../../core-server';
import promisify from '../../lib/promisify';
import * as pg from '../../lib/pg';

const writeAsync = promisify(pg.write.bind(pg));
const emitAsync = promisify(bus.emit.bind(bus));

export function buildSql(user, contacts, time) {
	const sql = [];
	sql.push('INSERT INTO contacts(referrer, createtime, contact) values');
	const valuePart = contacts.map(contact => ({
		$: '(&(referrer), &(createtime), &(contact))',
		referrer: user,
		createtime: time,
		contact
	}));
	sql.push(pg.cat(valuePart, ','));
	return [ pg.cat(sql) ];
}

function saveContacts(sql) {
	return writeAsync(config.connStr, sql);
}

async function getUser(session) {
	const change = await emitAsync('change', {
		auth: {
			session
		}
	});

	return change.response.state.user;
}

async function handleContacts(session, contacts) {
	const user = await getUser(session);
	const sql = buildSql(user, contacts, Date.now());

	try {
		await saveContacts(sql);
		return {
			success: true
		};
	} catch (e) {
		return {
			success: false,
			message: e.message
		};
	}
}

bus.on('http/init', app => {
	app.use(route.post('/x/contacts', function *() {
		const request = this.request.body;
		try {
			this.body = yield handleContacts(request.auth.session, request.data);
		} catch (e) {
			this.throw(500, e.message);
		}
	}));
});
