/* eslint max-nested-callbacks: 0 */
/* eslint quotes: 0*/
import { config } from '../../core-server';
import * as Constants from '../../lib/Constants';
import Counter from '../../lib/counter';
import Logger from '../../lib/logger';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import * as pg from '../../lib/pg';
import send from './sendEmail';
import handlebars from 'handlebars';
import getMailObj from './buildMailObj';
const MENTION_INTERVAL = 60 * 60 * 1000, MENTION_DELAY = 60 * 60 * 1000,
	template = handlebars.compile(fs.readFileSync(__dirname + '/../../../templates/' +
	config.app_id + '.digest.hbs', 'utf-8').toString()), log = new Logger(__filename),
	connStr = config.connStr, conf = config.email, counter = new Counter();

let lastEmailSent, end, i = 0;

function initMailSending (userRel) {

	const user = userRel.currentUser;

	if (!user.identities || !Array.isArray(user.identities)) {
		log.info('No identities found for user: ', user);
		return;
	}

	const rels = userRel.currentRels,
		mailIds = user.identities.filter((el) => {
			return /mailto:/.test(el);
		});
	mailIds.forEach((mailId) => {
		counter.inc();
		const emailAdd = mailId.slice(7);
		const emailHtml = template({
				token: jwt.sign({ email: emailAdd }, conf.secret, { expiresIn: '5 days' }),
				domain: conf.domain,
				rooms: rels,
			}),
			emailSub = `You h've been mentioned`;
			// console.log("rels[0].threads: ", rels.length)
		send(conf.from, emailAdd, emailSub, emailHtml, (e) => {
			if (!e) {
				log.info('Mention email successfully sent');
				counter.dec();
			} else {
				counter.err(e);
			}
		});
		counter.then((e) => {
			if (e) {
				log.error(e);
				return;
			}
			pg.write(connStr, [ {
				$: 'UPDATE jobs SET lastrun=&{end} WHERE id=&{jid}',
				end,
				jid: Constants.JOB_EMAIL_MENTION,
			} ], (error) => {
				lastEmailSent = end;
				log.info('Mention email sent to ', i, ' users');
				if (!error) log.info('successfully updated jobs for mention email');
			});
		});
	});
}

function sendMentionEmail() {
	let start = lastEmailSent;
	let row = false;
	end = Date.now() - MENTION_DELAY;

	if (conf.debug) {
		log.info('email debug is enabed');
		start = 0; end = Date.now();
	}

	pg.readStream(connStr, {
		$: `SELECT * FROM
					(SELECT item, "user", roles FROM threadrels WHERE roles @> '{2}' AND createtime >= &{start} AND createtime <&{end}) AS threadrels,
					(SELECT id threadid, name threadtitle, createtime, counts->'children' children, parents[1] parents FROM threads) AS threads,
					(SELECT id userid, name username, identities FROM users) AS users,
					(SELECT id roomid, name roomname FROM rooms) AS rooms
				WHERE threadrels.item=threads.threadid AND threadrels.user=users.userid AND
				threads.parents=rooms.roomid ORDER BY users.userid`,
		start,
		end,
	}).on('row', (urel) => {
		row = true;
		log.info("Got user to send mention email: ", urel);
		const emailObj = getMailObj(urel) || {};
		if (Object.keys(emailObj).length !== 0) {
			++i;
			log.info("emailObj: ", emailObj);
			initMailSending(emailObj);
		}
	}).on('end', () => {
		if (!row) {
			log.info('Did not get any user for mention email');
		}
		const c = getMailObj({});
		// console.log("c: ", c)
		i++;
		initMailSending(c);
		log.info('ended');
	});

}

export default function (row: Object) {
	lastEmailSent = row.lastrun;
	log.info('starting mention email');
	sendMentionEmail();
	setInterval(sendMentionEmail, MENTION_INTERVAL);
}
