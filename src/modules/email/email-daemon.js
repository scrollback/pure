/* @flow */

import * as pg from '../../lib/pg';
import Logger from '../../lib/logger';
import { config } from '../../core-server';
import sendWelcomeEmail from './welcomeEmail';
import sendMentionEmail from './mentionEmail';
import sendDigestEmail from './digestEmail';
import {
	JOB_EMAIL_WELCOME,
	JOB_EMAIL_DIGEST,
	JOB_EMAIL_MENTION,
} from '../../lib/Constants';

const conf = config.email, connString = config.connStr, log = new Logger(__filename);

if (!conf.auth.user && !conf.auth.pass) {
	log.info('Email module not enabled');
} else {
	log.info('Email module ready.');
	pg.read(connString, {
		$: 'SELECT * FROM jobs WHERE id in (&(ids))',
		ids: [ JOB_EMAIL_WELCOME, JOB_EMAIL_DIGEST, JOB_EMAIL_MENTION ],
	}, (err, results) => {
		if (err) return;
		log.info('Results: ', results);
		results.forEach((row) => {
			switch (row.id) {
			case JOB_EMAIL_WELCOME:
				sendWelcomeEmail(row);
				break;
			case JOB_EMAIL_MENTION:
				sendMentionEmail(row);
				break;
			case JOB_EMAIL_DIGEST:
				sendDigestEmail(row);
				break;
			default:
				log.error('wrong job id');
				break;
			}
		});
	});
}
