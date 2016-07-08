/* flow */
/* eslint-disable no-console, no-param-reassign */

import dns from 'dns';
import { Socket } from 'net';
import EventEmitter from 'events';
import promisify from './promisify';
import winston from 'winston';

function createSmtpConnection(mx: string): Promise<any> {
	const socket = new Socket();
	const connection = socket.connect(25, mx);
	let resolve, reject;

	const send = command => {
		connection.write(command);
		connection.write('\r\n');
		return new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		});
	};

	const close = () => {
		connection.removeAllListeners();
		socket.destroy();
	};

	function clear() {
		resolve = null;
		reject = null;
	}

	connection.setEncoding('ascii');

	connection.on('connect', () => {
		winston.info('EMAIL-SCRUBBER', `connection established for the mx: ${mx}`);
	});

	connection.on('data', data => {
		try {
			const [ , responseCode, msg ] = data.match(/\n?(\d{3})\s+(.*)/);
			if (resolve) {
				let responseToResolve;
				if (parseInt(responseCode, 10) === 220) {
					responseToResolve = {
						responseCode: parseInt(responseCode, 10),
						msg,
						send,
						close
					};
				} else {
					responseToResolve = {
						responseCode: parseInt(responseCode, 10),
						msg
					};
				}
				resolve(responseToResolve);
			}
			clear();
		} catch (e) {
			winston.info(this._LOG_TAG, `error while destructuring ${data} response from mx server`);
			this.emit('error', e);
		}
	});

	connection.on('timeout', () => {
		if (reject) {
			reject(new Error('connection timed out'));
		}
	});

	connection.on('error', (error) => {
		if (reject) {
			reject(error);
		}
	});

	return new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});
}

export default class BulkEmailChecker extends EventEmitter {
	constructor ({ maxRcptPerConn = 350, timeoutLimit = 10 * 1000, fromEmail = 'billgates@gmail.com' } = {}) {
		super();
		this._dnsCache = {};
		this._emailCache = {};
		this._MAX_RCPT_TO_PER_CONN = maxRcptPerConn;
		this._TIMEOUT_LIMIT = timeoutLimit;
		this._fromEmail = fromEmail;
		this._connectionCount = 0;
		this._LOG_TAG = 'EMAIL-SCRUBBER';
		this._resolveMxPromise = promisify(dns.resolveMx.bind(dns));
	}

	get connectionCount(): number {
		return this._connectionCount;
	}

	async _verifyBucket(domain: string, emails: Array<string>) {
		let lastLength = 0;
		let mxRecords, mx;

		const errorOut = () => {
			for (const email of emails) {
				this.emit('data', {
					email,
					isValid: 'unsure'
				});
			}
		};

		if (this._dnsCache[domain]) {
			mx = this._dnsCache[domain];
		} else {
			try {
				mxRecords = await this._resolveMxPromise(domain);

				// get the lowest priority mx for that domain
				mx = mxRecords.sort((recordA, recordB) => {
					return recordA.priority - recordB.priority;
				})[0].exchange;

				// update the dns cache
				this._dnsCache[domain] = mx;

				while (emails.length && emails.length !== lastLength) {
					let connection, response;
					try {
						connection = await createSmtpConnection.call(this, mx); // eslint-disable-line babel/no-await-in-loop
						if (connection.responseCode !== 220) {
							errorOut();
							return;
						}
						response = await connection.send(`HELO ${domain}`); // eslint-disable-line babel/no-await-in-loop
						if (response.responseCode !== 250) {
							errorOut();
							return;
						}
						response = await connection.send(`MAIL FROM: <${this._fromEmail}>`); // eslint-disable-line babel/no-await-in-loop
						if (response.responseCode !== 250) {
							errorOut();
							return;
						}
						lastLength = emails.length;
						for (let i = 0; i < emails.length; i++) {
							const email = emails[i];
							try {
								response = await connection.send(`RCPT TO: <${email}>`); // eslint-disable-line babel/no-await-in-loop
							} catch (err) {
								emails.splice(0, i);
								break;
							}

							switch (response.responseCode) {
							case 250:
								this.emit('data', {
									email,
									isValid: true
								});
								break;
							case 450:
							case 550:
								this.emit('data', {
									email,
									isValid: false
								});
								break;
							case 251:
							case 252:
							case 551:
							case 553:
								this.emit('data', {
									email,
									isValid: 'unsure'
								});
								break;
							default:
								emails.splice(0, i);
								break;
							}
						}

						connection.close();
					} catch (e) {
						errorOut();
						return;
					}
				}
			} catch (err) {
				this.emit('error', err);
			}
		}
	}

	add(email: string) {
		if (!/^\S+@\S+\.\S+$/.test(email)) {
			this.emit('data', {
				email,
				isValid: false
			});
		} else {
			try {
				const [ , domain ] = email.split('@');
				if (!this._emailCache[domain]) {
					this._emailCache[domain] = [];
				}
				this._emailCache[domain].push(email);
				if (this._emailCache[domain].length > this._MAX_RCPT_TO_PER_CONN) {
					this._connectionCount++;
					this._verifyBucket(domain, this._emailCache[domain])
						.catch((error) => this.emit('error', error))
						.then(() => {
							this._connectionCount--;
							if (this._connectionCount === 0) {
								this.emit('end');
							}
						});
					this._emailCache[domain] = [];
				}
			} catch (e) {
				this.emit('error', `Not a valid email address ${email}, Error: ${e}`);
			}
		}
	}

	done() {
		for (const domain in this._emailCache) {
			if (this._emailCache[domain].length) {
				this._connectionCount++;
				this._verifyBucket(domain, this._emailCache[domain])
					.catch((error) => this.emit('error', error))
					.then(() => {
						this._connectionCount--;
						if (this._connectionCount === 0) {
							this.emit('end');
						}
					});
				this._emailCache[domain] = [];
			}
		}
	}
}


/*
	- Api Demo
	const bec = new BulkEmailChecker();

	- You can instantiate it by passing options as well.
	const bec = new BulkEmailChecker({ maxRcptPerConn: 1 });

	-available options:
		-maxRcptPerConn: Default = 350.
		-timeoutLimit: default = 10 * 1000.
		-fromEmail: The email you want to make request from.

	bec.on('data', data => console.log(data));
	bec.on('error', error => console.log(error));
	bec.on('end', () => console.log('Perform all the tasks dependent on data now !'));

	bec.add('sales@somedomain.com');
	bec.add('someotherid@somedomain.com');
	bec.done();

	- Result:
		{email: sales@somedomain.com, isValid: true}
		{email: someotherid@somedomain.com, isValid: false}
		{email: someotherid@unknowndomain.com, isValid: unsure}

	- isValid can be true, false or unsure.
*/
