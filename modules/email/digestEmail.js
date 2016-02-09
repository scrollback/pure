"use strict";
const DIGEST_INTERVAL = 60 * 60 * 1000,
	  DIGEST_DELAY = 24 * 60 * 60 * 1000;
let config = require("../../core").config.email,
	send, connStr, constants = require("../../lib/constants"),
	log = require("winston"),
	fs = require("fs"),
	handlebars = require("handlebars"),
	pg = require("../../lib/pg"),
	jwt = require("jsonwebtoken"), lastEmailSent,
	connstr = "pg://" + config.pg.username + ":" + config.pg.password + "@" + config.pg.server + "/" + config.pg.db,
	template = handlebars.compile(fs.readFileSync(__dirname + "/views/" + config.appName + ".digest.hbs", "utf-8"));

function getSubject(rels) {
	var counts = rels.length - 1, heading = "";
	heading = "[" + rels[0].room + "] " + rels[0].threads[0].threadTitle + " +"+ counts + " more";
	return heading;
}

function initMailSending (userRel) {
	let user = userRel.currentUser,
		rels = userRel.currentRels,
		emailAdd = user.identities.filter((ident) => ident.indexOf("mailto:") === 0),
		emailHtml = template({
			token: jwt.sign({ email: emailAdd }, config.secret, {expiresIn: "5 days"}),
			domain: config.domain,
			rooms: rels
		}),
		emailSub = getSubject(rels);
	send(config.from, emailAdd, emailSub, emailHtml);
}

function sendDigestEmail () {
	let getMailObj = require("./prepareMailObj"),
		startPoint = Date().now - 2 * DIGEST_DELAY,
		start = lastEmailSent < startPoint ? lastEmailSent : startPoint,
		end = Date.now() - DIGEST_DELAY;
	
	function getTimezone(hour) {
		let UtcHrs = new Date().getUTCHours(),
		c = UtcHrs > 12 ? 24 - UtcHrs : UtcHrs

		let d = c > hour ? c-hour : hour-c,
			tz = d * 60;

		let tzMin = tz - 30,
			tzMax = tz + 30;
		return {min: tzMin, max: tzMax}
	}
	
	
	let tz = getTimezone(config.digestEmailTime)
	
	if(config.debug) {
		start = 0, end = Date.now(), tz.min = 0, tz.max = 1000
	}

	
	pg.readStream(connstr, {
		$: `WITH 
              urel AS (WITH u AS (SELECT * FROM users, roomrelations rr WHERE rr.user=users.id AND role >= &{follower} 
	          AND presencetime > &{start} AND presencetime < &{end} AND timezone >= &{min} AND timezone < &{max}) 
              SELECT u.id uid, rooms.name rname, * FROM u, rooms WHERE u.item=rooms.id)
            SELECT urel.uid uid, urel.rname rname, threads.name title, * FROM threads, urel where urel.item = threads.parents[1] 
            AND threads.updateTime > urel.presencetime order by uid`,
		start: start,
		end: end,
		follower: constants.ROLE_FOLLOWER,
		min: tz.min,
		max: tz.max
	}).on("row", (userRel) => {
		
		let emailObj = getMailObj(userRel) || {};
		
		if (Object.keys(emailObj).length !== 0) {
//			console.log(emailObj)
			initMailSending(emailObj);
		} 
	}).on("end", function() {
		let c = getMailObj({}); // empty obj to get email obj for last row data
		initMailSending(c);
		
		console.log("ended")
		pg.write(connstr, {
			$: "UPDATE jobs SET lastrun=&{end} WHERE jobid=&{jid}",
			end: end,
			jid: constants.JOB_EMAIL_DIGEST
		}, function (err, results) {
			if(!err) log.info("successfully updated jobs");
		});
	});
}

module.exports = (row) => {
	send = require("./sendEmail");
	lastEmailSent = row.lastrun;
	let UtcMnts = new Date().getUTCMinutes();
	let delay = UtcMnts < 30 ? 30 : 90,
		after = config.debug ? 0 : (delay-UtcMnts)*60000;	
	
	setTimeout(function(){
		sendDigestEmail();
		setInterval(sendDigestEmail, DIGEST_INTERVAL);
	}, after);
}
module.exports.initMailSending = initMailSending;
