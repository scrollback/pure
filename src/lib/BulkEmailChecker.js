/* flow */
/* eslint-disable no-console, no-param-reassign */

import dns from 'dns';
import { Socket } from 'net';
import EventEmitter from 'events';
import winston from 'winston';
import promisify from './promisify';

type MxRecord = {
    exchange: string;
    priority: number;
}

export default class BulkEmailChecker extends EventEmitter {
	constructor ({ maxRcptPerConn = 350, timeoutLimit = 10 * 1000, fromEmail = 'billgates@gmail' } = {}) {
		console.log(maxRcptPerConn, timeoutLimit, fromEmail);
		super();
		this._dnsCache = {
			valid: {},
			invalid: []
		};
		this._emailCache = {};
		this._unsureEmailCahce = {};
		this._emails = [];
		this._MAX_RCPT_TO_PER_CONN = maxRcptPerConn;
		this._TIMEOUT_LIMIT = timeoutLimit;
		this._fromEmail = fromEmail;
		this._LOG_TAG = 'EMAIL-SCRUBBER';
		this._resolveMxPromise = promisify(dns.resolveMx.bind(dns));
	}

	_getMxWithLowestPriority(mxRecords: Array<MxRecord>) {
		return mxRecords.sort((recordA, recordB) => {
			return recordA.priority - recordB.priority;
		})[0].exchange;
	}

	_writeCommand(connection: any, command: string, writeIndex: number): number {
		connection.write(command);
		connection.write('\r\n');
		return ++writeIndex;
	}

	async _validateEmail(connection: any, email: string, sayHELO: boolean) {
		const [ , domain ] = email.split('@');
		return new Promise((resolve, reject) => {
			let writeIndex = 1;
			let retryCount = 1;
			if (!/^\S+@\S+\.\S+$/.test(email)) {
				resolve(false);
			}
			if (!sayHELO) {
				/*
					For MX which allow multiple rcpt to in a single transcation, Resolve the result directly.
					If they don't they will emit a data event with code 451.
				*/
				writeIndex = this._writeCommand(connection, `rcpt to: <${email}>`, writeIndex) + 2;
			}
			connection.on('data', data => {
				if (data.indexOf('220') === 0 || data.indexOf('250') === 0 || data.indexOf('\n220') !== -1 || data.indexOf('\n250') !== -1) {
					switch (writeIndex) {
					case 1:
						writeIndex = this._writeCommand(connection, `HELO ${domain}`, writeIndex);
						break;
					case 2:
						writeIndex = this._writeCommand(connection, `mail from: <${this._fromEmail}>`, writeIndex);
						break;
					case 3:
						writeIndex = this._writeCommand(connection, `rcpt to: <${email}>`, writeIndex);
						break;
					case 4:
						resolve(true);
						break;
					default:
						reject('unsure');
						break;
					}
				} else if (data.indexOf('\n550') !== -1 || data.indexOf('550') === 0) {
					resolve(false);
				} else if (data.indexOf('\n451') !== -1 || data.indexOf('451') === 0 || data.indexOf('\n452') !== -1 || data.indexOf('452') === 0) {
					/*
                		451: Multiple destination domains per transaction is unsupported.
                		452: Too many recipients.
						- Multiple rcpt to: <email> or too many recipients not allowed by the host in a single transaction.
						- write mail from: <mail> on each 451 or 452 data event and go to rcpt to: <email>.
						- if 452 occurs multiple times, make 5 attempts else reject to unsure.
                	*/
					if (retryCount > 5) {
						winston.info(this._LOG_TAG, 'Max retry limit exceeded, returning');
						reject('unsure');
					}
					winston.info(this._LOG_TAG, 'retrying...');
					writeIndex = 1;
					writeIndex = this._writeCommand(connection, `mail from: <${this._fromEmail}>`, writeIndex) + 1;
					++retryCount;
				} else {
					reject('unsure');
				}
			});
			connection.on('error', () => {
				reject('unsure');
			});
			connection.on('timeout', () => {
				reject('unsure');
			});
		});
	}

	async _checkResultsForBucketHelper(mx: string, emailBucket: Array<string>) {
		const socket = new Socket();
		const connection = socket.connect(25, mx);
		connection.setEncoding('ascii');
		connection.on('connect', () => winston.info(this._LOG_TAG, `connection established for ${mx}`));
		connection.on('close', () => {
			socket.connect(25, mx);
			return;
		});
		let sayHELO = true;
		for (const email of emailBucket) {
			try {
				winston.info(this._LOG_TAG, `validating email: ${email}`);
				const isValid = await this._validateEmail(connection, email, sayHELO); // eslint-disable-line babel/no-await-in-loop
				sayHELO = false;
				winston.info(this._LOG_TAG, `{email: ${email}, isValid: ${isValid}}`);
				this.emit('data', {
					email,
					isValid
				});
			} catch (e) {
				// emit unsure as response for this email and continue.
				this.emit('data', {
					email,
					isValid: e
				});
			}
		}
		connection.removeAllListeners();
		socket.destroy();
	}

	async _checkResultsForBucket(mx: string, emailBucket: Array<string>) {
		try {
			winston.info(this._LOG_TAG, `validating emails for ${mx} bucket`);
			await this._checkResultsForBucketHelper(mx, emailBucket);
		} catch (e) {
			winston.info(this._LOG_TAG, `An error occured while connecting to ${mx}: ${e}`);
			this._unsureEmailCahce[mx] = emailBucket;
		} finally {
			delete this._emailCache[mx];
		}
	}

	async _buildDnsAndEmailCache(email: string) {
		const [ , domain ] = email.split('@');
		try {
			if (!this._dnsCache.valid[domain] && !this._dnsCache.invalid.indexOf(domain) > -1) {
				const mxRecords = await this._resolveMxPromise(domain);
				const mx = this._getMxWithLowestPriority(mxRecords);
				this._dnsCache.valid[domain] = mx;
			}
			if (!this._dnsCache.valid[domain]) {
				return;
			}
			const mx = this._dnsCache.valid[domain];
			if (!this._emailCache[mx]) {
				this._emailCache[mx] = [];
			}
			this._emailCache[mx].push(email);
			if (this._emailCache[mx].length >= this._MAX_RCPT_TO_PER_CONN) {
				const emailBucket = this._emailCache[mx];
				winston.info(this._LOG_TAG, emailBucket);
				await this._checkResultsForBucket(mx, emailBucket);
			}
		} catch (error) {
			if (error.code === 'ENOTFOUND') {
				if (!this._dnsCache.invalid.indexOf(domain) > -1) {
					winston.info(this._LOG_TAG, `Added ${domain} to the list of invalid DNS.`);
					this._dnsCache.invalid.push(domain);
				}
			} else {
				this.emit('error', error);
			}
		}
	}

	add(email: string) {
		this._emails.push(email);
	}

	async check() {
		for (const email of this._emails) {
			await this._buildDnsAndEmailCache(email); // eslint-disable-line babel/no-await-in-loop
		}
		// check all the emails which are less than _MAX_RCPT_TO_PER_CONN in number.
		for (const mx in this._emailCache) {
			const emailBucket = this._emailCache[mx];
			await this._checkResultsForBucket(mx, emailBucket); // eslint-disable-line babel/no-await-in-loop
		}
		// check the unsure emails once again.
		for (const mx in this._unsureEmailCahce) {
			const emailBucket = this._unsureEmailCahce[mx];
			try {
				await this._checkResultsForBucketHelper(mx, emailBucket); // eslint-disable-line babel/no-await-in-loop
			} catch (e) {
				winston.info(this._LOG_TAG, `An error occured while connecting to ${mx}: ${e}`);
				// Do Nothing if something if an error occurs this time.
			} finally {
				delete this._unsureEmailCahce[mx];
			}
		}
		this.emit('end');
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
	bec.on('end', () => console.log('You can do whatever you want !'));

	bec.add('sales@somedomain.com');
	bec.add('someotherid@somedomain.com');
	bec.check();

	- Result:
		{email: sales@somedomain.com, isValid: true}
		{email: someotherid@somedomain.com, isValid: false}

	- isValid can be true, false or unsure.
*/
