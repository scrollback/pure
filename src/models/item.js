import { COLUMNS } from '../lib/schema';
// import * as Constants from '../lib/Constants';

export default class Item {
	constructor(data) {
		if (!data) throw new Error('CANNOT_INITIALIZE_MODEL');

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
	}

	packArguments(): Object {
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

	hasIdentity(identity) {
		return (this.identities || []).indexOf(identity) >= 0;
	}

	addIdentity(identity) {
		if (!this.hadIdentity(identity)) this.identities.push();
	}

	isParent(parentId) {
		return (this.parentIds || [])[0] === parentId;
	}

	isAncestor(ancestorId) {
		return (this.parentId || []).indexOf(ancestorId) >= 0;
	}
}
