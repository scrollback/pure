/* eslint max-nested-callbacks: 0 */
/* eslint babel/no-await-in-loop: 0 */
import { config } from '../../core-server';
import Logger from '../../lib/logger';
import fs from 'fs';
import handlebars from 'handlebars';
import * as pg from '../../lib/pg';
import jwt from 'jsonwebtoken';
import send from './sendEmail';

const DIGEST_INTERVAL = 60 * 60 * 1000,
	template = handlebars.compile(
		fs.readFileSync(__dirname + '/../../../templates/' + config.app_id + '.digest.hbs', 'utf-8').toString()
	),
	connStr = config.connStr, conf = config.email;
let lastEmailSent; /* end,*/
const log = new Logger(__filename, 'digest');

function initMailSending (userThreadRel) {
	const threads = userThreadRel.threadRels,
		user = userThreadRel.user;

	for (let i = 0; i < threads.length; i++) {
		if (i === 3) {
			threads[i].indexFourth = true;
		}
		if (i < 3) {
			threads[i].showBody = true;
		}
	}

	if (!user.identities || !Array.isArray(user.identities)) {
		log.info('No identities found for user: ', user);
		return;
	}

	const mailIds = user.identities.filter((el) => {
		return /mailto:/.test(el);
	});
	if (mailIds.length === 0) return;
	const emailAdd = mailIds[0].slice(7),
		emailSub = threads[0].threadtitle + ' & More from Belong',
		date = new Date().getDate(),
		month = new Date().getMonth() + 1,
		year = new Date().getFullYear(),
		formattedDate = date + '-' + month + '-' + year,
		templateObj = {
			token: jwt.sign({ email: emailAdd }, conf.secret, { expiresIn: '5 days' }),
			domain: config.server.protocol + '//' + config.server.host,
			link: '?utm_source=DailyDigest&utm_medium=Email&utm_term=' + encodeURIComponent(user.id) +
			 '&utm_content=' + encodeURIComponent(emailSub) + '&utm_campaign=' + encodeURIComponent(formattedDate),
			threads,
			email: emailAdd,
			sub: emailSub
		},
		emailHtml = template(templateObj);
	log.info('Digest email to: ', emailAdd);
	send(conf.from, emailAdd, emailSub, emailHtml, e => {
		if (e) {
			log.error(e);
		}
	});
}

async function sendDigestEmail () {
	const today = new Date().toString().split(' ')[2],
		lastEmailSentDay = new Date(parseInt(lastEmailSent, 10)).toString().split(' ')[2];

	if (new Date().getUTCHours() !== 2) { // Send at 7am IST. Move this to config
		log.info('Not digest email time: ', new Date().getUTCHours());
		return;
	}

	// Do not send digest email multiple times in the same day
	// This to prevent if server restarts multiple times in single hour. (cron job)
	if (today === lastEmailSentDay) {
		log.info('Digest email has been sent today. Last email sent time is: ', new Date((parseInt(lastEmailSent, 10))));
		return;
	}
	log.info('Starting digest email');
	let range;

	if (new Date().getDay() % 2 === 0) {
		range = '^[a-o]';
	} else {
		range = '^[p-z]|^[0-9]';
	}
	const puser = {};
	let i = 0, threadRels = [];
	pg.readStream(connStr, {
		$: `SELECT
					users.id userid, users.identities, users.name username,
					CAST(coalesce(rooms.counts ->> 'follower' , '0') as integer) follower,
					threads.counts->>'children' children, threads.score,
					threads.name threadtitle, threads.creator, threads.body,
					threads.meta->'photo'->>'thumbnail_url' photo,
					threads.score/(1+ 0.1*CAST(coalesce(rooms.counts ->> 'follower' , '0') as integer)) scoreperfollower,
					threads.counts->>'upvote' upvote, threads.createtime,
					threads.id threadid, rooms.name roomname, rooms.id roomid
					FROM roomrels, threads, rooms, users
						WHERE
							users.presencetime IS NOT NULL
							AND users.id ~ &{range}
							AND (users.params-> 'email'->>'frequency' = 'daily' OR (users.params->'email') IS NULL)
							AND roomrels.user=users.id AND threads.parents[1]=roomrels.item
							AND (threads.counts->'upvote') IS NOT NULL
							AND CAST(coalesce(threads.counts ->> 'upvote' , '0') as integer) > 2
							AND roomrels.item=rooms.id AND threads.counts IS NOT NULL
							AND CAST(coalesce(threads.counts ->> 'children' , '0') as integer) > 2
							AND threads.createtime >= extract(epoch from now()-interval '2 days')*1000
							AND threads.creator NOT IN ('juhi', 'shreyaskutty', 'belong', 'belongbot')
							AND roles @> '{3}'
				ORDER BY users.id, scoreperfollower DESC`,
		range
	}).on('row', row => {
		// console.log(row);
		if (row.userid !== puser.id && threadRels.length > 0) {
			log.info('Got threads: ', threadRels.length);
			++i;
			threadRels = threadRels.slice(0, 8);
			initMailSending({ threadRels, user: puser });
			threadRels = [];
		}
		puser.id = row.userid;
		puser.identities = row.identities;
		puser.name = row.username;
		delete row.userid;
		delete row.identities;
		delete row.username;
		threadRels.push(row);

	}).on('end', () => {
		i++;
		log.info('Sending digest email to last user: ', puser, threadRels.length);
		log.info('Got ', i, ' users');
		threadRels = threadRels.slice(0, 8);
		initMailSending({ threadRels, user: puser });
		conf.sendConfirmEmailTo.forEach(email => {
			send(conf.from, email, 'No. of Daily mails to Belong Users',
				'Today Digest email has been sent to ' + i + ' users',
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
	setTimeout(() => {
		sendDigestEmail();
		setInterval(sendDigestEmail, DIGEST_INTERVAL);
	});
}
