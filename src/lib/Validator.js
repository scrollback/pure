/* @flow */

import EnhancedError from './EnhancedError';

export default class Validator {
	static reservedWords = [
		'undefined', 'null',
		'room', 'user', 'thread', 'entity',
		'admin', 'owner', 'root',
		'missing', 'loading', 'failed', 'error',
	];

	static validate(name) {
		let message, code;

		if (typeof name !== 'string') {
			message = 'must be a string';
			code = 'E_VALIDATE_TYPE';
		} else if (name === '') {
			message = 'cannot be empty';
			code = 'E_VALIDATE_EMPTY';
		} else if (/\s/.test(name)) {
			message = 'cannot have spaces';
			code = 'E_VALIDATE_SPACES';
		} else if (/[^0-9a-z\-]/.test(name)) {
			message = 'can have only letters, numbers and hyphens (-)';
			code = 'E_VALIDATE_CHARS';
		} else if (name.length < 3) {
			message = 'should be more than 3 characters long';
			code = 'E_VALIDATE_LENGTH_SHORT';
		} else if (name.length > 32) {
			message = 'should be less than 32 characters long';
			code = 'E_VALIDATE_LENGTH_LONG';
		} else if (/^[^a-z0-9]/.test(name)) {
			message = 'must start with a letter or number';
			code = 'E_VALIDATE_START';
		} else if (/^[0-9]+$/.test(name)) {
			message = 'should have at least 1 letter';
			code = 'E_VALIDATE_NO_ONLY_NUMS';
		} else if (Validator.reservedWords.indexOf(name) > -1) {
			message = 'cannot be a reserved word';
			code = 'E_VALIDATE_RESERVED';
		}

		if (message && code) {
			throw new EnhancedError(message, code);
		}
	}
}
