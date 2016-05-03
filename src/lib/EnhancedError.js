/* @flow */

export default class EnhancedError extends Error {
	code: string;
	level: ?number;
	data: ?any;

	constructor(message: string, code: string, level?: number, data?: any) {
		super(message);

		this.name = this.constructor.name;
		this.message = message;
		this.code = code;
		this.level = level || 0;
		this.data = data || {};

		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, this.constructor);
		} else {
			this.stack = (new Error(message)).stack;
		}
	}

	packArguments(): Array<any> {
		return [ this.message, this.code, this.level || 0, this.data || {} ];
	}
}
