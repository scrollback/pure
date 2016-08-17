import winston from 'winston';
import fs from 'fs';
import util from 'util';

winston.setLevels(winston.config.npm.levels);
winston.addColors(winston.config.npm.colors);

export default class Logger {
	dir: Array<string>;
	transports: Array<Object>;
	newLogDir: any;
	logger: Object;

	constructor(path: any, file: string) {
		this.dir = path.split('/');
		this.checkForDir();
		this.logFileName = file ? 'files/' + file : this.buildFileName();
		this.transports = [ new winston.transports.Console({ colorize: true, level: 'debug' }),
		new (winston.transports.File)({
			filename: this.newLogDir + '/' + this.logFileName + '.log',
			maxsize: 5242880
		}) ];

		this.logger = new (winston.Logger)({ transports: this.transports });
	}

	buildFileName() {
		const date = new Date();
		const year = `${date.getFullYear()}`;
		const month = (date.getMonth() + 1) > 9 ? `${date.getMonth() + 1}` : `0${date.getMonth() + 1}`;
		const day = (date.getDate()) > 9 ? `${date.getDate()}` : `0${date.getDate()}`;
		const hours = (date.getHours()) > 9 ? `${date.getHours()}` : `0${date.getHours()}`;
		const mins = (date.getMinutes()) > 9 ? `${date.getMinutes()}` : `0${date.getMinutes()}`;
		const sec = (date.getSeconds()) > 9 ? `${date.getSeconds()}` : `0${date.getSeconds()}`;
		return year + month + day + hours + mins + sec;
	}

	checkForDir() {
		const logsDir = __dirname + '/../../logs/';

		this.newLogDir = logsDir + this.dir[this.dir.length - 2];

		if (!fs.existsSync(logsDir)) {
			fs.mkdirSync(logsDir);
		}
		if (!fs.existsSync(this.newLogDir)) {
			fs.mkdirSync(this.newLogDir);
		}
		if (!fs.existsSync(this.newLogDir + '/files')) {
			fs.mkdirSync(this.newLogDir + '/files');
		}
	}

	line(args: any) {
		const parts = [
				(new Date()).toISOString().replace(/T/, ':').replace(/^20/, '').replace(/.Z/, ''),
				this.dir[this.dir.length - 1]
			],
			logLine = util.format(...args).replace(/\s+/g, ' ');
		parts.push(logLine);
		return parts.join(' ');
	}

	error (...args: any) {
		this.logger.error(this.line(args));
	}

	debug (...args: any) {
		this.logger.debug(this.line(args));
	}

	info (...args: any) {
		this.logger.info(this.line(args));
	}

	warn (...args: any) {
		this.logger.warn(this.line(args));
	}
}
