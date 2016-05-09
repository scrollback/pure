/* @flow */

import * as pg from '../../lib/pg';
import winston from 'winston';
import { config } from '../../core-server';
import sendWelcomeEmail from './welcomeEmail';
import sendMentionEmail from './mentionEmail';
import sendDigestEmail from './digestEmail';
import {
	JOB_EMAIL_WELCOME,
	JOB_EMAIL_DIGEST,
	JOB_EMAIL_MENTION,
} from '../../lib/Constants';

const conf = config.email, connString = config.connStr;

if (!conf.auth.user && !conf.auth.pass) {
	winston.info('Email module not enabled');
} else {
	winston.info('Email module ready.');
	pg.read(connString, {
		$: 'SELECT * FROM jobs WHERE id in (&(ids))',
		ids: [ JOB_EMAIL_WELCOME, /* JOB_EMAIL_MENTION, */ JOB_EMAIL_DIGEST ],
	}, (err, results) => {
		if (err) return;
		winston.info('Results: ', results);
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
				winston.info('wrong job id');
				break;
			}
		});
	});
}
