/*
 * Converts Node callback API to a Promise based API
 *
 * @flow
 */

type NodeStyleFunction = (...args: any) => any;
type PromisifiedFunction = (...args: any) => Promise<any>;

export default function promisify(fn: NodeStyleFunction): PromisifiedFunction {
	return function(...args) {
		return new Promise((resolve, reject) => {
			args.push((error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
			fn(...args);
		});
	};
}
