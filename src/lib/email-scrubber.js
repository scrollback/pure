/* flow */
/* eslint-disable no-console, no-param-reassign, no-mixed-spaces-and-tabs */

import dns from 'dns';
import { Socket } from 'net';
import EventEmitter from 'events';
import winston from 'winston';
import callbackToPromise from './promisify';

export class BulkEmailChecker extends EventEmitter {
	_dnsCache = {
		valid: {},
		invalid: []
	};
	_emailCache = {};
	_unsureEmailCahce = {};
	_MAX_RCPT_TO_PER_CONN = 350;
	_TIMEOUT_LIMIT = 10 * 1000;
	_fromEmail = 'billgates@gmail.com'
	_resolveMxPromise = callbackToPromise(dns.resolveMx.bind(dns));

	_getMxWithLowestPriority = (mxRecords: Array<{ exchange: string; priority: number }>) => {
		return mxRecords.sort((recordA, recordB) => {
			return recordA.priority - recordB.priority;
		})[0].exchange;
	};

	_writeCommand = (connection: any, command: string, writeIndex: number): number => {
		connection.write(command);
		connection.write('\r\n');
		return ++writeIndex;
	}

	_validateEmail = async (connection: any, email: string, sayHELO: boolean) => {
		const [ , domain ] = email.split('@');
		return new Promise((resolve) => {
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
						resolve('unsure');
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
						- if 452 occurs multiple times, make 5 attempts else reslove to unsure.
                	*/
					if (retryCount > 5) {
						winston.info('Max retry limit exceeded, returning');
						resolve('unsure');
					}
					winston.info('retrying...');
					writeIndex = 1;
					writeIndex = this._writeCommand(connection, `mail from: <${this._fromEmail}>`, writeIndex) + 1;
					++retryCount;
				} else {
					resolve('unsure');
				}
			});
			connection.on('error', () => {
				resolve('unsure');
			});
			connection.on('timeout', () => {
				resolve('unsure');
			});
		});
	};

	_checkResultsForBucketHelper = async (mx: string, emailBucket: Array<string>) => {
		const socket = new Socket();
		const connection = socket.connect(25, mx);
		connection.setEncoding('ascii');
		connection.on('connect', () => winston.info(`connection established for ${mx}`));
		connection.on('close', () => {
			socket.connect(25, mx);
			return;
		});
		let sayHELO = true;
		for (const email of emailBucket) {
			try {
				winston.info(`validating email: ${email}`);
				const isValid = await this._validateEmail(connection, email, sayHELO); // eslint-disable-line babel/no-await-in-loop
				sayHELO = false;
				winston.info(`{email: ${email}, isValid: ${isValid}}`);
				this.emit('data', {
					email,
					isValid
				});
			} catch (e) {
				// Do nothing.
			}
		}
		connection.removeAllListeners();
		socket.destroy();
	};

	_checkResultsForBucket = async (mx: string, emailBucket: Array<string>) => {
		try {
			winston.info(`validating emails for ${mx} bucket`);
			await this._checkResultsForBucketHelper(mx, emailBucket);
		} catch (e) {
			winston.info(`An error occured while connecting to ${mx}: ${e}`);
			this._unsureEmailCahce[mx] = emailBucket;
		} finally {
			delete this._emailCache[mx];
		}
	}

	_buildDnsAndEmailCache = async (email: string) => {
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
				winston.info(emailBucket);
				await this._checkResultsForBucket(mx, emailBucket);
			}
		} catch (error) {
			if (error.code === 'ENOTFOUND') {
				if (!this._dnsCache.invalid.indexOf(domain) > -1) {
					winston.info(`Added ${domain} to the list of invalid DNS.`);
					this._dnsCache.invalid.push(domain);
				}
			} else {
				this.emit('error', error);
			}
		}
	};

	check = async (email: string) => {
		await this._buildDnsAndEmailCache(email);
	};

	done = async () => {
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
				winston.info(`An error occured while connecting to ${mx}: ${e}`);
				// Do Nothing if something if an error occurs this time.
			} finally {
				delete this._unsureEmailCahce[mx];
			}
		}
	};
}

/*
	- Api Demo
	const bec = new BulkEmailChecker();

	async function validateEmails() {
		await bec.check('someEmail@domain.com');
		await bec.done();
	}

	bec.on('data', data => console.log(data));
	bec.on('error', error => console.log(error));

	validateEmails();

	- Result:
		{email: someEmail@domain.com, isValid: false}
*/
