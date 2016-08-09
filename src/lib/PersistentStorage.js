/* @flow */

function getInstance(id: string) { // eslint-disable-line no-unused-vars
	const store = {};

	return {
		async setItem(key: string, data: any): Promise<void> {
			store[key] = data;
		},

		async getItem(key: string): Promise<any> {
			return store[key];
		},

		async removeItem(key: string): Promise<void> {
			delete store[key];
		},
	};
}

export default { getInstance };
