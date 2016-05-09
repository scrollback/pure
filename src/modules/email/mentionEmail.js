/* eslint max-nested-callbacks: 0 */
/* eslint quotes: 0*/
import { config } from '../../core-server';
import * as Constants from '../../lib/Constants';
import Counter from '../../lib/counter';
import log from 'winston';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import * as pg from '../../lib/pg';
import send from './sendEmail';
import handlebars from 'handlebars';
import getMailObj from './buildMailObj';
const MENTION_INTERVAL = 10 * 60 * 1000, MENTION_DELAY = 10 * 60 * 1000,
	template = handlebars.compile(fs.readFileSync(__dirname + '/../../../templates/' +
	config.app_id + '.digest.hbs', 'utf-8').toString()),
	connStr = config.connStr, conf = config.email, counter1 = new Counter();

let lastEmailSent, end;

function initMailSending (userRel) {

	const user = userRel.currentUser,
		rels = userRel.currentRels,
		mailIds = user.identities.filter((el) => {
			return /mailto:/.test(el);
		});
	mailIds.forEach((mailId) => {
		counter1.inc();
		const emailAdd = mailId.slice(7);
		const emailHtml = template({
				token: jwt.sign({ email: emailAdd }, conf.secret, { expiresIn: '5 days' }),
				domain: conf.domain,
				rooms: rels,
			}),
			emailSub = `You h've been mentioned in ${rels.length} rooms`;
			// console.log("rels[0].threads: ", rels.length)
		send(conf.from, emailAdd, emailSub, emailHtml, (e) => {
			if (!e) {
				log.info('Mention email successfully sent');
				counter1.dec();
			} else {
				counter1.err(e);
			}
		});
		counter1.then((e) => {
			if (e) {
				log.debug(e);
				return;
			}
			pg.write(connStr, [ {
				$: 'UPDATE jobs SET lastrun=&{end} WHERE id=&{jid}',
				end,
				jid: Constants.JOB_EMAIL_MENTION,
			} ], (error) => {
				if (!error) log.info('successfully updated jobs for mention email');
			});
		});
	});
}

function sendMentionEmail() {
	let start = lastEmailSent;
	const	counter = new Counter();

	let row = false;

	end = Date.now() - MENTION_DELAY;

	if (conf.debug) {
		log.info('email debug is enabed');
		start = 0; end = Date.now();
	}

	pg.readStream(connStr, {
		$: `with textrel as (select * from textrels join users on "user"=id where textrels.createtime>users.presencetime and roles @> '{${Constants.ROLE_MENTIONED}}' and textrels.createtime >= &{start} and textrels.createtime < &{end}) select *, texts.createtime tctime from textrel join texts on textrel.item=texts.id order by textrel.user`,
		start,
		end,
	}).on('row', (urel) => {
		row = true;
		// console.log("urel: ", urel.user);
		counter.inc();
		pg.read(connStr, {
			$: `select * from rooms where id=&{id} `, // and presencetime<&{roletime}
			id: urel.parents[1],
		}, (err, room) => {
			if (err) throw err;
			urel.roomName = room[0].name;
			pg.read(connStr, {
				$: `select * from threads where id=&{id} `, // and presencetime<&{roletime}
				id: urel.parents[0],
			}, (er, thread) => {
				if (er) throw er;
				urel.threadTitle = thread[0].name;
				urel.textCount = thread[0].counts.children;
				const emailObj = getMailObj(urel) || {};
				if (Object.keys(emailObj).length !== 0) {
					// console.log("emailObj: ", emailObj)
					initMailSending(emailObj);
				}
				counter.dec();
				counter.then(() => {
					const c = getMailObj({});
					// console.log("c: ", c)
					initMailSending(c);
				});
			});
		});
	}).on('end', () => {
		if (!row) {
			log.info('Did not get any user for mention email');
		}
		log.info('ended');
	});

}

export default function (row) {
	lastEmailSent = row.lastrun;
	log.info('starting mention email');
	sendMentionEmail();
	setInterval(sendMentionEmail, MENTION_INTERVAL);
}
