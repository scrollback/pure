/* eslint max-nested-callbacks: 0 */
import getMailObj from './buildMailObj';
import { config } from '../../core-server';
import * as Constants from '../../lib/Constants';
import Logger from '../../lib/logger';
import fs from 'fs';
import handlebars from 'handlebars';
import * as pg from '../../lib/pg';
import jwt from 'jsonwebtoken';
import send from './sendEmail';
import Counter from '../../lib/counter';
const DIGEST_INTERVAL = 60 * 60 * 1000, /*DIGEST_DELAY = 24 * 60 * 60 * 1000,*/
	template = handlebars.compile(
		fs.readFileSync(__dirname + '/../../../templates/' + config.app_id + '.digest.hbs', 'utf-8').toString()
	),
	connStr = config.connStr, conf = config.email, counter1 = new Counter(), log = new Logger(__filename);
let lastEmailSent, /*end,*/ i = 0;
const fields = [
		'roomrels.presencetime',
		'users.name',
		'threads.counts->>\'children\' children',
		'users.identities', 'users.id userid',
		'threads.score', 'threads.name threadtitle',
		'threads.createtime', 'threads.id threadid', 'rooms.name roomname',
		'rooms.id roomid'
	], joins = [
		'users',
		'roomrels',
		'threads',
		'rooms'
	], conditions = [
		'users.presencetime IS NOT NULL',
		'users.id ~ &{range}',
		'users.id=roomrels.user',
		'threads.parents[1]=roomrels.item',
		'roomrels.item=rooms.id',
		'threads.counts IS NOT NULL',
		'threads.createtime >= extract(epoch from now()-interval \'1 days\')*1000',
		'(users.params-> \'email\'->>\'frequency\' = \'daily\' OR (users.params->\'email\') is null)',
		'roles @> \'{3}\''
	],
	query = pg.cat(
		[
			'SELECT ', pg.cat(fields, ', '),
			'FROM ', pg.cat(joins, ', '),
			'WHERE ', pg.cat(conditions, ' AND '),
			'ORDER BY users.id'
		]
	);

function getSubject() {
	const heading = 'Updates from ' + config.app_name;
	return heading;
}

export function initMailSending (userRel: Object) {
	const user = userRel.currentUser;
	if (!user.identities || !Array.isArray(user.identities)) {
		log.info('No identities found for user: ', user);
		return;
	}
	const	rels = userRel.currentRels/* .splice(0, 4)*/,
		mailIds = user.identities.filter((el) => {
			return /mailto:/.test(el);
		});

	mailIds.forEach((mailId) => {
		counter1.inc();
		const emailAdd = mailId.slice(7),
		emailSub = getSubject(rels),
		date = Date.now();
		const templateObj = {
			token: jwt.sign({ email: emailAdd }, conf.secret, { expiresIn: '5 days' }),
			domain: config.server.protocol + '//' + config.server.host,
			link : '?utm_source=DailyDigest&utm_medium=Email&utm_term='+ encodeURIComponent(emailAdd) + '&utm_content=' + encodeURIComponent(emailSub) + '&utm_campaign=' + date,
			rooms: rels,
			email: emailAdd,
			sub: emailSub,
			date
		};
		const	emailHtml = template(templateObj);
		log.info('Digest email to: ', emailAdd);

		send(conf.from, emailAdd, emailSub, emailHtml, (e) => {
			if (!e) {
				log.info('Digest email successfully sent');
			}
			counter1.dec();
		});
	});
	counter1.then(() => {
		log.info('successfully updated jobs for digest email');
		pg.write(connStr, [ {
			$: 'UPDATE jobs SET lastrun=&{end} WHERE id=&{jid}',
			end: Date.now(),
			jid: Constants.JOB_EMAIL_DIGEST,
		} ], (error) => {
			if (!error) {
				log.info('successfully updated jobs for digest email');
				log.info('Digest email sent to ', i, ' users');
			}
		});
	});
}

function sendDigestEmail () {
	let range;
	const today = new Date().toString().split(" ")[2],
		lastEmailSentDay = new Date(parseInt(lastEmailSent, 10)).toString().split(" ")[2];

	if(new Date().getUTCHours() !== 22) { //Send at 3am IST. Move this to config
		log.info('Not digest email time: ', new Date().getUTCHours());
		return;
	}

	//Do not send digest email multiple times in the same day
	// This to prevent if server restarts multiple times in single hour. (cron job)
	if ( today === lastEmailSentDay	) {
		log.info('Digest email has been sent today. Last email sent time is: ', new Date((parseInt(lastEmailSent, 10))));
		return;
	}

if (new Date().getDay() % 2 === 0) {
	range = '^[a-o]';
} else {
	range = '^[p-z]|^[0-9]';
}

	log.info('Starting digest email');
	// const startPoint = Date.now() - 30 * DIGEST_DELAY;
	// let	start = /*lastEmailSent < startPoint ? lastEmailSent :*/ startPoint;
	// end = Date.now() - 2 * DIGEST_DELAY;

	// function getTimezone(hour) {
	// 	const UtcHrs = new Date().getUTCHours(),
	// 		c = UtcHrs > 12 ? 24 - UtcHrs : UtcHrs,
	// 		d = hour - c,
	// 		tz = d * 60,
	// 		tzMin = tz - 30,
	// 		tzMax = tz + 30;
	//
	// 	return { min: tzMin, max: tzMax };
	// }
	//
	// const timeZone = getTimezone(conf.digestEmailTime);
	//
	// log.info('timezone: ', timeZone);
	// if (conf.debug) {
	// 	start = 0; end = Date.now();
	// 	timeZone.min = 0;
	// 	timeZone.max = 1000;
	// }

	// query.start = start;
	// query.end = end;
	// query.min = timeZone.min;
	// query.max = timeZone.max;
	query.range = range;
	pg.readStream(config.connStr, query).on('row', (urel) => {
		// log.info('Got user: ', urel.userid);
		const emailObj = getMailObj(urel) || {};

		if (Object.keys(emailObj).length !== 0) {
			++i;
			log.info('send email to: ', i, emailObj.currentUser);
			initMailSending(emailObj);
		}
	}).on('end', () => {
		const endUser = getMailObj({});
		i++;
		log.info('Sending to last user: ', endUser);
		for (const j in endUser.currentRels) {
			log.debug('c.currentRels[j].threads.length: ', endUser.currentRels[j].threads.length);
		}
		initMailSending(endUser);
		// console.log('Got ', i, 'users');
		log.info('ended digest email');
		conf.sendConfirmEmailTo.forEach(email => {
				send(conf.from, email, 'No. of Daily mails to Belong Users',
				'Today Digest email has been sent to '+i+' users',
				e => {
				if (!e) {
					log.info('Confirmation email successfully sent');
				}
			});
		});
	});
}

export default function (row: Object) {
	lastEmailSent = row.lastrun;
	// const UtcMnts = new Date().getUTCMinutes(),
	// 	delay = UtcMnts < 30 ? 30 : 90,
	// 	after = conf.debug ? 0 : (delay - UtcMnts) * 60000;

	// function mtns(millis) {
	// 	  const minutes = Math.floor(millis / 60000),
	// 		seconds = ((millis % 60000) / 1000).toFixed(0);
	// 	  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
	// }
	//
	// log.info('Digest email will be sent after ', mtns(after), 'minutes');
	setTimeout(() => {
		sendDigestEmail();
		setInterval(sendDigestEmail, DIGEST_INTERVAL);
	});
}
