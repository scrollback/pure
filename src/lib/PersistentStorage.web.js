/* @flow */

function getInstance(id: string) {

	const getKeyWithPrefix = (key: string) => {
		return `persistent_storage:${id}:${key}`;
	};

	return {
		async setItem(key: string, data: any): Promise<void> {
			localStorage.setItem(getKeyWithPrefix(key), JSON.stringify(data));
		},

		async getItem(key: string): Promise<any> {
			const data = localStorage.getItem(getKeyWithPrefix(key));

			if (typeof data === 'string') {
				return JSON.parse(data);
			} else {
				return null;
			}
		},

		async removeItem(key: string): Promise<void> {
			localStorage.removeItem(getKeyWithPrefix(key));
		},
	};
}

export default { getInstance };
