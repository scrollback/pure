import log from 'winston';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import * as pg from '../../lib/pg';
import send from './sendEmail.js';
import { Constants, config } from '../../core-server';
const WELCOME_INTERVAL = 1 * 60 * 1000, WELCOME_DELAY = 1 * 60 * 1000, connStr = config.connStr, conf = config.email,
	template = handlebars.compile(fs.readFileSync(__dirname + '/../../../templates/' +
	config.app_id + '.welcome.hbs', 'utf-8').toString());

let lastEmailSent, end;

function initMailSending(cUserRel) {
	const user = cUserRel.user,
		rels = cUserRel.rels,
		emailAdd = user.identities[1].slice(7),
		emailHtml = template({
			user: user.id,
			rels,
			domain: conf.domain,
			token: jwt.sign({ email: emailAdd.substring(8, emailAdd.length) }, conf.secret, { expiresIn: '2 days' })
		});

	send(conf.from, emailAdd, 'Welcome to ' + config.app_id, emailHtml, (e) => {
		if (!e) {
			log.info('Welcome email successfully sent');
			pg.write(connStr, [ {
				$: 'UPDATE jobs SET lastrun=&{end} WHERE id=&{jid}',
				end,
				jid: Constants.JOB_EMAIL_WELCOME
			} ], (error) => {
				lastEmailSent = end;
				if (!error) log.info('successfully updated jobs for welcome email');
			});
		}
	});
}

function sendWelcomeEmail () {
	end = Date.now() - /*10000*/ WELCOME_DELAY;

	if (conf.debug) {
		log.info('debug is enabled');
		lastEmailSent = 0;
		end = Date.now();
	}
	pg.readStream(connStr, {
		$: 'SELECT * FROM users WHERE createtime >&{start} AND createtime <= &{end}',
		start: lastEmailSent,
		end
	}).on('row', (user) => {
		log.info('Got a new user: ', user.id);
		const userRel = {}, rels = [];

		userRel.user = user;

		pg.readStream(connStr, {
			$: 'SELECT * FROM roomrels JOIN rooms ON item=id where \"user\" = &{user}',
			user: user.id
		}).on('row', (rel) => {
			rels.push(rel);
		}).on('end', () => {
			userRel.rels = rels;
			log.info('sending email to user: ', userRel.user.id);
			initMailSending(userRel);
		});
	}).on('end', () => {

		log.info('ended Welcome email');
	});
}

export default function (row) {
	lastEmailSent = row.lastrun;
	log.info('starting welcome email');
	sendWelcomeEmail();
	setInterval(sendWelcomeEmail, /*10000*/ WELCOME_INTERVAL);
}
