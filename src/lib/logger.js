import winston from 'winston';
import fs from 'fs';
import util from 'util';
winston.setLevels(winston.config.npm.levels);
winston.addColors(winston.config.npm.colors);

export default class Logger{
	dir: Array<string>;
	transports: Array<Object>;
	newLogDir: any;
	logger: Object;

	constructor(file: any) {
		this.dir = file.split('/');
		this.checkForDir();
		this.transports = [ new winston.transports.Console({ colorize: true, level: 'debug' }),
		new (winston.transports.File)({
			filename: this.newLogDir + '/' + new Date().getTime() + '.log',
			maxsize: 5242880
		}) ];

		this.logger = new (winston.Logger)({ transports: this.transports });
	}

	checkForDir() {
		const logsDir = __dirname + '/../../logs/';

		this.newLogDir = logsDir + this.dir[this.dir.length-2];

		if (!fs.existsSync(logsDir)) {
			fs.mkdirSync(logsDir);
		}
		if (!fs.existsSync(this.newLogDir)) {
			fs.mkdirSync(this.newLogDir);
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
