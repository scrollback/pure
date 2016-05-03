/* eslint max-nested-callbacks: 0 */
import getMailObj from './buildMailObj';
import { config } from '../../core-server';
import * as Constants from '../../lib/Constants';
import log from 'winston';
import fs from 'fs';
import handlebars from 'handlebars';
import * as pg from '../../lib/pg';
import jwt from 'jsonwebtoken';
import send from './sendEmail';
import Counter from '../../lib/counter';
const DIGEST_INTERVAL = 60 * 60 * 1000, DIGEST_DELAY = 24 * 60 * 60 * 1000,
	template = handlebars.compile(fs.readFileSync(__dirname + '/../../../templates/' + config.app_id + '.digest.hbs', 'utf-8').toString()),
	connStr = config.connStr, conf = config.email, counter1 = new Counter();

let lastEmailSent, end;


function getSubject() {
	// const counts = rels.length - 1;
	// const heading = '[' + rels[0].room + '] ' + rels[0].threads[0].threadTitle + ' +' + counts + ' more';
	const heading = 'Updates from ' + config.app_name;
	return heading;
}

export function initMailSending (userRel) {
	// console.log("init mio djf: ", userRel)
	// console.log("counter1.pending: ", counter1.pending)
	const user = userRel.currentUser,
		rels = userRel.currentRels,
		mailIds = user.identities.filter((el) => {
			return /mailto:/.test(el);
		});
	mailIds.forEach((mailId) => {
		counter1.inc();
		const emailAdd = mailId.slice(7),
			emailHtml = template({
				token: jwt.sign({ email: emailAdd }, conf.secret, { expiresIn: '5 days' }),
				domain: config.server.protocol + '//' + config.server.host + ':' + config.server.port,
				rooms: rels
			}),
			emailSub = getSubject(rels);
// console.log("rels[0].threads: ", rels)
		send(conf.from, emailAdd, emailSub, emailHtml, (e) => {
			if (!e) {
				log.info('Digest email successfully sent');
				counter1.dec();
				// console.log('counter1.pending: ',counter1.pending)
			}
		});
	});
	counter1.then(() => {
		pg.write(connStr, [ {
			$: 'UPDATE jobs SET lastrun=&{end} WHERE id=&{jid}',
			end,
			jid: Constants.JOB_EMAIL_DIGEST
		} ], (error) => {
			if (!error) log.info('successfully updated jobs for digest email');
		});
	});
}

function sendDigestEmail () {
	log.info('Starting digest email');
	const startPoint = Date.now() - 2 * DIGEST_DELAY,
		counter = new Counter();

	end = Date.now() - DIGEST_DELAY;
	let	start = lastEmailSent < startPoint ? lastEmailSent : startPoint;

	function getTimezone(hour) {
		const UtcHrs = new Date().getUTCHours(),
			c = UtcHrs > 12 ? 24 - UtcHrs : UtcHrs,
			d = hour - c,
			tz = d * 60,
			tzMin = tz - 30,
			tzMax = tz + 30;

		return { min: parseInt(tzMin), max: parseInt(tzMax) };
	}

	const timeZone = getTimezone(conf.digestEmailTime);

	log.info('timezone: ', timeZone);
	if (conf.debug) {
		start = 0; end = Date.now(); /* tz.min = 0; tz.max = 1000; */
	}

	pg.readStream(config.connStr, {
		$: 'with urel as (select rrls.presencetime ptime, users.name uname, * from users join roomrels rrls on users.id=rrls.user where NOT(params  @> \'{"email":{"frequency": "never", "notifications": false}}\') and roles @> \'{3}\' and rrls.presencetime >= &{start} and rrls.presencetime < &{end} and timezone >= &{min} and timezone < &{max}) select threads.counts, urel.params, urel.tags, threads.createtime tctime, threads.id threadId, * from urel join threads on threads.parents[1]=urel.item order by urel.id', // where threads.createtime > urel.ptime
		start,
		end,
		follower: Constants.ROLE_FOLLOWER,
		min: timeZone.min,
		max: timeZone.max
	}).on('row', (urel) => {
	// console.log('Got user for digest email: ', urel);
		counter.inc();
		pg.read(config.connStr, {
			$: 'select * from rooms where id=&{id} ', // and presencetime<&{roletime}
			id: urel.parents[0]
		}, (err, room) => {
			if (err) throw err;
			urel.roomName = room[0].name;
			urel.roomId = room[0].id;
			// console.log(urel)
			const emailObj = getMailObj(urel) || {};

// console.log(emailObj)
			if (Object.keys(emailObj).length !== 0) {
				initMailSending(emailObj);
			}
			counter.dec();
			counter.then(() => {
				const c = getMailObj({});

				initMailSending(c);
			});
		});
	}).on('end', () => {
		log.info('ended digest email');
	});
}

export default function (row) {
	lastEmailSent = row.lastrun;
	const UtcMnts = new Date().getUTCMinutes(),
		delay = UtcMnts < 30 ? 30 : 90,
		after = conf.debug ? 0 : (delay - UtcMnts) * 60000;

	function mtns(millis) {
		  const minutes = Math.floor(millis / 60000),
			seconds = ((millis % 60000) / 1000).toFixed(0);
		  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
	}

	log.info('Digest email will be sent after ', mtns(after), 'minutes');
	setTimeout(() => {
		sendDigestEmail();
		setInterval(sendDigestEmail, DIGEST_INTERVAL);
	}, after);
}
