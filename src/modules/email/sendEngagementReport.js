import * as pg from '../../lib/pg';
import fs from 'fs';
import handlebars from 'handlebars';
import { config } from '../../core-server';
import send from './sendEmail';
import Logger from '../../lib/logger';

const template = handlebars.compile(
  fs.readFileSync(__dirname + '/../../../templates/engagementReport.hbs', 'utf-8').toString()
);
const connstr = config.connStr, log = new Logger(__filename, 'engagementReport');
function sendEmail() {
	if (config.email.auth && !config.email.auth.user && !config.email.host) return;
	const data = [];
	pg.readStream(connstr, {
		$: `SELECT
			threads.creator AS creator,
			to_char(to_timestamp((threads.createtime + 5.5 * 60 * 60 * 1000)/1000), 'Day, DD  HH12:MI:SS')
				AS createtime,
			threads.name AS title,
			rooms.name AS room,
			threads.id threadid, rooms.id roomid,
			threads.counts as counts
		FROM
			threads,
			rooms
		WHERE
			threads.parents[1] = rooms.id AND
			threads.creator NOT IN (
				'belong',
				'belongbot',
				'juhi',
				'shreyaskutty'
			) AND
			threads.createtime > extract(epoch from NOW() - INTERVAL '3 HOURS') * 1000
		ORDER BY
			threads.createtime ASC`
	}).on('row', row => {
		row.createtime = row.createtime.split(',')[1].split(' ')[3].slice(0, 5);
		// console.log(row);
		data.push(row);
	}).on('end', () => {
		log.info(data);
		if (data.length === 0) return;
		const emailHtml = template({ rows: data });
		// console.log(emailHtml)
		send('belong@bel.ng', 'content@bel.ng', 'Hourly engagement report', emailHtml, e => {
			if (!e) log.info('engagement report successfully sent');
		});
	});
}

sendEmail();
setInterval(sendEmail, 60 * 60 * 1000);
