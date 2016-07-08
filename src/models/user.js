import { COLUMNS } from '../lib/schema';
import * as Constants from '../lib/Constants';

export default class User {
	constructor(data) {
		if (!data) { throw new Error('CANNOT_INITIALIZE_MODEL'); }
		if (!data.type) { data.type = Constants.TYPE_USER; }
		if (data.type !== Constants.TYPE_USER) {
			throw (new Error('INVALID_TYPE'));
		}

		if (!data.id) { throw new Error('INVALID_USER_ID'); }

		for (const n of COLUMNS[Constants.TYPE_USER]) {
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
		if (data.signedIdentities) this.signedIdentities = data.signedIdentities;
	}

	packArguments(): Object {
		const data = {};

		for (const name of COLUMNS[Constants.TYPE_USER]) {
			if (typeof this[name] !== 'undefined') {
				data[name] = this[name];
			}
		}

		data.type = this.type;
		if (this.error) data.error = this.error;
		if (this.signedIdentities) data.signedIdentities = this.signedIdentities;
		return [ data ];
	}

	hasIdentity(identity: string) {
		return this.identities.indexOf(identity) > -1 || false;
	}

	addIdentity(identity: string) {
		if (!this.hasIdentity(identity)) this.identities.push();
	}
}
