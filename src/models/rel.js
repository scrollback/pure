import { COLUMNS } from '../lib/schema';
import { TYPE_REL } from '../lib/Constants';

export default class Relation {
	constructor(data) {
		if (!data) throw new Error('CANNOT_INITIALIZE_MODEL');
		if (!data.type) data.type = TYPE_REL;

		if (!COLUMNS[data.type]) { throw new Error('INVALID_TYPE'); }

		for (const n of COLUMNS[data.type]) {
			const name = n.toLowerCase();
			if (typeof data[name] !== 'undefined' || typeof data[n] !== 'undefined') {
				let value = data[n] || data[name];

				if ([ 'createtime', 'updatetime', 'deletetime' ].indexOf(name) >= 0) {
					value = parseInt(value);
					if (Number.isNaN(value)) continue;
				}

				this[n] = value;
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
