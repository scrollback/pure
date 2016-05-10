/* @flow */

type Shape = { [key: string]: string | Function };
type Defaults = { [key: string]: any };

export default function(shape: Shape, defaults?: Defaults) {
	return class Model {
		constructor(item: Object) {
			for (const prop in defaults) {
				if (typeof item[prop] === 'undefined') {
					item[prop] = defaults[prop];
				}
			}

			for (const prop in item) {
				const value = item[prop];
				const type = shape[prop];

				if (type) {
					if (typeof type === 'string') {
						if (typeof value !== type) {
							throw new Error(`Invalid type for ${prop} in ${item}. Expected ${type}. Found ${typeof value}`);
						}
					} else if (typeof type === 'function') {
						const result = type(value);

						if (result instanceof Error) {
							throw result;
						}

						if (result === false) {
							throw new Error(`Invalid type for ${prop} in ${item}`);
						}
					}
				}
			}

			// Postgres is case-insensitive, so we need to check by lowercasing the props
			for (const name in shape) {
				if (typeof item[name.toLowerCase()] !== 'undefined' || typeof item[name] !== 'undefined') {
					/* $FlowFixMe */
					this[name] = item[name] || item[name.toLowerCase()];
				}
			}
		}

		packArguments(): Array<Object> {
			const data = {};

			for (const name in shape) {
				/* $FlowFixMe */
				if (typeof this[name] !== 'undefined') {
					data[name] = this[name];
				}
			}

			return [ data ];
		}
	};
}
