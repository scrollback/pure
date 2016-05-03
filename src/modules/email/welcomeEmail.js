import log from 'winston';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import * as pg from '../../lib/pg';
import Counter from '../../lib/counter';
import send from './sendEmail';
import { config } from '../../core-server';
import * as Constants from '../../lib/Constants';

const WELCOME_INTERVAL = 5 * 60 * 1000, WELCOME_DELAY = 5 * 60 * 1000, connStr = config.connStr, conf = config.email,
	template = handlebars.compile(fs.readFileSync(__dirname + '/../../../templates/' +
	config.app_id + '.welcome.hbs', 'utf-8').toString());

let lastEmailSent, end;

function initMailSending(cUserRel) {
	const counter = new Counter();

	const user = cUserRel.user,
		rels = cUserRel.rels,
		mailIds = user.identities.filter((el) => {
			return /mailto:/.test(el);
		});
	mailIds.forEach((mailId) => {
		counter.inc();
		const emailAdd = mailId.slice(7);
		log.info('Sending email to:', emailAdd);
		const emailHtml = template({
			user: user.id,
			rels,
			domain: config.server.protocol + '//' + config.server.host + ':' + config.server.port,
			token: jwt.sign({ email: emailAdd }, conf.secret, { expiresIn: '2 days' })
		});

		send(conf.from, emailAdd, 'Welcome to ' + config.app_name, emailHtml, (e) => {
			if (e) {
				log.error('Error in sending email');
				counter.err(e);
				return;
			}
			counter.dec();
		});
	});
	counter.then((e) => {
		if (e) {
			log.info('Welcome email not sent', e);
			return;
		}
		log.info('Welcome email successfully sent');
		pg.write(connStr, [ {
			$: 'UPDATE jobs SET lastrun=&{end} WHERE id=&{jid}',
			end,
			jid: Constants.JOB_EMAIL_WELCOME
		} ], (error) => {
			lastEmailSent = end;
			if (!error) log.info('successfully updated jobs for welcome email');
		});
	});
}

function sendWelcomeEmail () {
	end = Date.now() - /* 10000 */ WELCOME_DELAY;

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
			$: 'SELECT * FROM roomrels JOIN rooms ON item=id where "user" = &{user}',
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
	log.info('starting welcome email', 'last sent: ', lastEmailSent);
	sendWelcomeEmail();
	setInterval(sendWelcomeEmail, /* 10000 */ WELCOME_INTERVAL);
}
