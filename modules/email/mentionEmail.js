"use strict";
const MENTION_INTERVAL = 10 * 60 * 1000,
	  MENTION_DELAY = 10 * 60 * 1000;

let pg = require("../../lib/pg"),
	constants = require("../../lib/constants"), connStr,lastEmailSent;

function sendMentionEmail() {
	let getMailObj = require("./buildMailObj"),
		initMailSending = require("./digestEmail").initMailSending,
		start = lastEmailSent,
		end = Date.now() - MENTION_DELAY;
	pg.readStream(connStr, {
		$: `with
				r as (SELECT * FROM textrels, users WHERE "user" = id AND roles @> '{3}')
			select * from r, texts WHERE r.item=texts.id order by r.user`,
		start: start,
		end: end,
	}).on("row", (userRel) => {
		let emailObj = getMailObj(userRel) || {};
		if (Object.keys(emailObj).length !== 0) initMailSending(emailObj);
	}).on("end", function() {
		let c = getMailObj({});
		initMailSending(c);
		pg.write(connString, {
			$: "UPDATE jobs SET lastrun=&{end} WHERE jobid=&{jid}",
			end: end,
			jid: constants.JOB_EMAIL_MENTION
		}, function (err, results) {
			if(!err) log.i("successfully updated jobs");
		});
	});
}

module.exports = (row, conf) => {
	connStr = "pg://" + conf.pg.username + ":" + conf.pg.password + "@" + conf.pg.server + "/" + conf.pg.db;
	lastEmailSent = row.lastrun;
	console.log(lastEmailSent)
	sendMentionEmail()
	setInterval(sendMentionEmail, MENTION_INTERVAL);
}