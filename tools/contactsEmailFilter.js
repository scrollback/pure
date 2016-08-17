/* eslint-disable no-console, no-param-reassign */

import * as pg from '../src/lib/pg';
import BulkEmailChecker from '../src/lib/BulkEmailChecker';
import Logger from '../src/lib/logger';
import promisify from '../src/lib/promisify';
import { config } from '../src/core-server';
import fs from 'fs';

const LIMIT_CONTACT_TO = config.contactsFilter.limitContactTo;
// const JOB_INVOCATION_INTERVAL = config.contactsFilter.jobInvocationInterval;
const performReadQuery = promisify(pg.read.bind(pg, config.connStr));
const performWriteQuery = promisify(pg.write.bind(pg, config.connStr));
const log = new Logger(__filename);
const verifyMails = async () => {
	log.info('Starting verify emails');
	const validMails = [];
	const invalidMails = [];
	const unsureMails = [];
	const bec = new BulkEmailChecker();
	let blacklist;

	function escape(reg) {
		return reg.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
	}

	if (fs.existsSync(__dirname + '/emailBlackList')) {
		blacklist = new RegExp(fs.readFileSync(__dirname + '/emailBlackList')
		.toString('utf-8').trim().split('\n').map(w => {
			return '\\b' + escape(w) + '\\b';
		}).join('|'));
	}

	const contacts = await performReadQuery({
		$: `SELECT contact->>'email' AS email FROM contacts
		WHERE (contact->>'email') IS NOT NULL AND lastmailverifytime IS NULL LIMIT &{LIMIT_CONTACT_TO}`,
		LIMIT_CONTACT_TO
	});

	bec.on('data', data => {
		if (data.isValid === true && validMails.indexOf(data.email) === -1) {
			validMails.push(data.email);
		} else if (data.isValid === false && invalidMails.indexOf(data.email) === -1) {
			invalidMails.push(data.email);
		} else if (data.isValid === 'unsure' && unsureMails.indexOf(data.email) === -1) {
			unsureMails.push(data.email);
		}
	});

	bec.on('error', async error => {
		log.info(error);
		if (error.code === 'ENOTFOUND') {
			const now = Date.now();
			await performWriteQuery([ {
				$: `UPDATE contacts SET valid='false', lastmailverifytime = &{now}
				WHERE (contact->>'email') IS NOT NULL AND contact->>'email' IN (&(invalidMails))`,
				now,
				invalidMails: error.emails,
			} ]);
		}
		if (error.code === 'ENODATA') {
			const now = Date.now();
			await performWriteQuery([ {
				$: `UPDATE contacts SET valid='unsure', lastmailverifytime = &{now}
				WHERE (contact->>'email') IS NOT NULL AND contact->>'email' IN (&(unsureMails))`,
				now,
				unsureMails: error.emails,
			} ]);
		}
	});
	const queries = [];
	bec.on('end', async () => {
		const now = Date.now();
		if (validMails.length > 0) {
			queries.push({
				$: `UPDATE contacts SET valid='true', lastmailverifytime = &{now}
				WHERE (contact->>'email') IS NOT NULL AND contact->>'email' IN (&(validMails));`,
				now,
				validMails,
			});
		}
		if (invalidMails.length > 0) {
			queries.push({
				$: `UPDATE contacts SET valid='false', lastmailverifytime = &{now}
				WHERE (contact->>'email') IS NOT NULL AND contact->>'email' IN (&(invalidMails));`,
				now,
				invalidMails,
			});
		}
		if (unsureMails.length > 0) {
			queries.push({
				$: `UPDATE contacts SET valid='unsure', lastmailverifytime = &{now}
				WHERE (contact->>'email') IS NOT NULL AND contact->>'email' IN (&(unsureMails));`,
				now,
				unsureMails,
			});
		}
		await performWriteQuery(queries);
	});

	for (const contact of contacts) {
		log.info('got this contact: ', contact);
		if (
			(blacklist && blacklist.test(contact.email)) ||
			contact > 50
		) {
			invalidMails.push(contact.email);
			log.info('Black listed: ', contact);
			continue;
		}
		bec.add(contact.email);
	}
	bec.done();
	log.info('Got ', contacts.length, 'contacts');
};

verifyMails();
