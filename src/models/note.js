import { COLUMNS } from '../lib/schema';
import { TYPE_NOTE } from '../lib/Constants';

export default class Note {
	constructor(data) {
		if (!data) throw new Error('CANNOT_INITIALIZE_MODEL');
		if (!data.type) data.type = TYPE_NOTE;
		if (data.type !== TYPE_NOTE) throw new Error('INVALID_TYPE');

		for (const name of COLUMNS[TYPE_NOTE]) {
			if (typeof data[name.toLowerCase()] !== 'undefined' || typeof data[name] !== 'undefined') {
				this[name] = data[name] || data[name.toLowerCase()];
			}
		}
		if (data.error) this.error = data.error;
		Object.defineProperty(this, 'id', {
			get: () => this.user + '_' + this.event + '_' + this.group,
			enumerable: false,
		});
	}

	packArguments() {
		const data = {};

		for (const name of COLUMNS[TYPE_NOTE]) {
			if (typeof this[name] !== 'undefined') {
				data[name] = this[name];
			}
		}

		if (this.error) data.error = this.error;
		return [ data ];
	}

	getId() {
		return this.user + '_' + this.event + '_' + this.group;
	}
}
