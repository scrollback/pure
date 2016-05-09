import { config } from '../../core-server';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import log from 'winston';
const transport = nodemailer.createTransport(smtpTransport({
	host: 'email-smtp.us-west-2.amazonaws.com',
	protocol: 'smtp',
	secureConnection: true,
	port: 465,
	auth: config && config.email && config.email.auth,
}));

export default function send (from, to, sub, html, cb) {
	const email = {
		from,
		to,
		subject: sub,
		html,
		bcc: config && config.bcc || '',
	};

	transport.sendMail(email, (e) => {
		if (e) {
			if (cb) cb(e);
			log.info('error in sending email: ', e, 'retrying...');
			setTimeout(() => {
				send(email.from, email.to, email.subject, email.html);
			}, 300000);
		} else {
			log.info('Email sent successfully to ', email.to);
			if (cb) cb(null);
		}
	});
}
