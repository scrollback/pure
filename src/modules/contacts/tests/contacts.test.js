import test from 'ava';
import { buildSql } from './../contacts';

test('should generate SQL query for single contact', t => {
	const time = Date.now();
	const sql = buildSql('harish', [
		{
			name: 'harish',
			phone: 320394234,
			email: 'cmsodf@dslkmf.com'
		}
	], time);

	t.deepEqual(sql, [ {
		$: 'INSERT INTO contacts(referrer, createtime, contact) values (&(referrer), &(createtime), &(contact))',
		referrer: 'harish',
		createtime: time,
		contact: {
			name: 'harish',
			phone: 320394234,
			email: 'cmsodf@dslkmf.com'
		}
	} ]);
});

test('should generate SQL query for multiple contacts', t => {
	const time = Date.now();
	const sql = buildSql('harish', [
		{
			name: 'harish',
			phone: 320394234,
			email: 'cmsodf@dslkmf.com'
		},
		{
			name: 'satya',
			phone: 320394234,
			email: 'cmsodf@dslkmf.com'
		}
	], time);

	t.deepEqual(sql, [ {
		$: 'INSERT INTO contacts(referrer, createtime, contact) values (&(referrer), &(createtime), &(contact)),(&(referrer), &(createtime), &(contact_1))',
		contact: {
			email: 'cmsodf@dslkmf.com',
			name: 'harish',
			phone: 320394234
		},
		contact_1: {
			name: 'satya',
			email: 'cmsodf@dslkmf.com',
			phone: 320394234
		},
		createtime: time,
		referrer: 'harish'
	} ]);
});
