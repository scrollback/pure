"use strict";
const WELCOME_INTERVAL = 5 * 60 * 1000,
	  WELCOME_DELAY = 5 * 60 * 1000;

import winston from "winston";
import fs from "fs";
import jwt from "jsonwebtoken";
import handlebars from "handlebars";
import pg from "../../lib/pg";
import send from "./sendEmail.js";
import {Constants} from "../../core";
let template = handlebars.compile(fs.readFileSync(__dirname + "/views/welcomeEmail.hbs", "utf-8")),
	lastEmailSent, config, connStr ;

function initMailSending(cUserRel) {
	if(!cUserRel.user) return
	let user = cUserRel.user,
		rels = cUserRel.rels,
		emailAdd = user.identities[0],
		emailHtml = template({
			user: user.id,
			rels: rels,
			domain: config.domain,
			token: jwt.sign({ email: emailAdd.substring(8, emailAdd.length) }, config.secret, {expiresIn: "2 days"})
		});
	send(config.from, emailAdd, "Welcome to " + config.appName, emailHtml);
}

function sendWelcomeEmail () {
	let getMailObj = require("./buildMailObj");
	let end = Date.now() - 10000/*WELCOME_DELAY*/;
//	let newUser = false;
	pg.readStream(connStr, {
		$: `SELECT * FROM users WHERE NOT(tags @> '{10}') AND createtime >&{start} AND createtime <= &{end} `,
		guest: Constants.TAG_USER_GUEST,
		start: lastEmailSent,
		end: end
	}).on("row", (user) => {
		winston.info("Got a new user: ", user.id)
		newUser = true
		let userRel = {} , rels = [];
		userRel.user = user
		pg.readStream(connStr, {
			$: `SELECT * FROM roomrels JOIN rooms ON item=id where \"user\" = &{user}`,
			user: user.id
		}).on("row", (rel) => {
			rels.push(rel)
		}).on("end", () => {
			userRel.rels = rels;
			winston.info("sending email to user: ", userRel.user.id)
			initMailSending(userRel)
		})
	}).on("end", () => {
		pg.write(connStr, [{
			$: "UPDATE jobs SET lastrun=&{end} WHERE jobid=&{jid}",
			end: end,
			jid: Constants.JOB_EMAIL_WELCOME
		}], function (err, results) {
			lastEmailSent = end;
			if(!err) winston.info("successfully updated job for welcome email ");
//			if (!newUser) winston.info("no new users created")
		});
	});
}

module.exports = (row, conf) => {
	config = conf;
	connStr = "pg://" + config.pg.username + ":" + config.pg.password + "@" + config.pg.server + "/" + config.pg.db;
	lastEmailSent = row.lastrun;
	sendWelcomeEmail();
	setInterval(sendWelcomeEmail, 10000/*WELCOME_INTERVAL*/);
}
