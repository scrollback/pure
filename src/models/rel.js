import { COLUMNS } from '../lib/schema';
import { TYPE_REL } from '../lib/Constants';

export default class Relation {
	constructor(data) {
		if (!data) throw new Error('CANNOT_INITIALIZE_MODEL');
		if (!data.type) data.type = TYPE_REL;

		if (!COLUMNS[data.type]) { throw new Error('INVALID_TYPE'); }

		for (const name of COLUMNS[data.type]) {
			if (typeof data[name.toLowerCase()] !== 'undefined' || typeof data[name] !== 'undefined') {
				this[name] = data[name] || data[name.toLowerCase()];
			}
		}

		if (data.error) this.error = data.error;

		Object.defineProperty(this, 'id', {
			get: () => this.user + '_' + this.item,
			enumerable: false,
		});
	}

	packArguments() {
		const data = {};

		for (const name of COLUMNS[this.type]) {
			if (typeof this[name] !== 'undefined') {
				data[name] = this[name];
			}
		}

		data.type = this.type;
		if (this.error) data.error = this.error;
		return [ data ];
	}
}
