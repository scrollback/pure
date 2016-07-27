import Logger from '../../lib/logger';
import fs from 'fs';
import handlebars from 'handlebars';
import * as pg from '../../lib/pg';
import promisify from '../../lib/promisify';
import send from './sendEmail';
import juice from 'juice';
import { config } from '../../core-server';
const log = new Logger(__filename);
const JOB_INVOCATION_INTERVAL = config.invitationEmail.interval;
const conf = config.email;
const readSync = promisify(pg.read.bind(pg, config.connStr));
const template = handlebars.compile(fs.readFileSync(__dirname + '/../../../templates/' + config.app_id + '.invite.hbs', 'utf-8').toString());
let perUserLog;
const initMailSending = (invitee, inviterLocalityName, inviterName) => {
	const emailBody = template({
		link: '&referrer=utm_source%3DBelongInvite%26utm_medium%3DEmail%26utm_term%3D'+ encodeURIComponent(inviterName) + '%26utm_content%3D'+encodeURIComponent(invitee.contact.email)+'%26utm_campaign%3D'+Date.now(),
		referrer: inviterName,
		inviterLocalityName
	});
	const inlinedTemplate = juice(emailBody);
	send(conf.from, invitee.contact.email, `Introducing Belong: Referred by ${inviterName}`, inlinedTemplate, e => {
		if (e) {
			perUserLog.error('Error in sending email');
			return;
		}
		pg.write(config.connStr, [ {
			$: `UPDATE contacts SET lastmailtime = &{now} WHERE
				referrer = &{referrer} AND contact->>'email' = &{email}`,
			now: Date.now(),
			email: invitee.contact.email,
			referrer: invitee.referrer
		} ], (err, res) => {
			if (err) {
				perUserLog.error(err);
			} else {
				perUserLog.info(`successfully updated ${res[0].rowCount} row(s) the contacts table`);
			}
		});
	});
};

const sendInvitationEmail = () => {
	const UTCHours = new Date().getUTCHours();
	// Do not send any mails between 8:30 pm (IST) and 6:30 am
	if (UTCHours >17 && UTCHours < 2) {
		log.info('Do not send invitations in these hours: ', UTCHours);
		return;
	}
	let row = false;
	pg.readStream(config.connStr, {
		$: `SELECT * FROM contacts WHERE (contact->>'email') IS NOT NULL AND valid = 'true'
			AND lastmailtime IS NULL LIMIT &{limit}`,
		limit: config.invitationEmail.limit /*5*/
	})
	.on('row', async invitee => {
		row = true;
		log.info(`starting invitation process for invitee with email ${invitee.contact.email}, referred by ${invitee.referrer}`);
		let inviterLocalityName;
		const user = await readSync({
			$: 'select *  from users where id=&{id}',
			id: invitee.referrer
		});
		let userName = user[0].name || user[0].id;
		log.info('refferer: ', user);
		const userExists = await readSync({
			$: 'select *  from users where identities @> &{identities}',
			identities: [invitee.contact.email]
		});
		if (userExists.length > 0) {
			perUserLog.info('This user exists: ', userExists);
			return;
		}
		const roomFollowing = await readSync({
			$: `SELECT rooms.name AS roomname FROM rooms
				JOIN roomrels ON id = item WHERE "user" = &{user} AND rooms.tags @> '{22}'
				AND roomrels.roles <> '{}' LIMIT 1`,
			user: invitee.referrer
		});

		inviterLocalityName = roomFollowing[0].roomname;
		log.info(`Found locality associated with inviter: ${userName} is ${inviterLocalityName}`);
		perUserLog = new Logger(__filename, invitee.contact.email);
		perUserLog.info(`Sending invitation email to: ${invitee.contact.email}`);
		initMailSending(invitee, inviterLocalityName, userName);
	})
	.on('end', () => {
		if (row) log.info('invitation process finished !');
		else log.info('Did not send any invitation email');
	});
};

export default function () {
	setTimeout(() => {
		log.info('Starting invitation email.');
		sendInvitationEmail();
		setInterval(sendInvitationEmail, JOB_INVOCATION_INTERVAL);
	}, /*3000,*/ config.invitationEmail.delay);
}
