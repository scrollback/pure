/* @flow */

export default class PersistentStorage {
	_id: string;
	_data: { [key: string]: any } = {};

	constructor(id: string) {
		this._id = id;
	}

	async setItem(key: string, data: any): Promise<void> {
		this._data[key] = data;
	}

	async getItem(key: string): Promise<any> {
		return this._data[key];
	}

	async removeItem(key: string): Promise<void> {
		delete this._data[key];
	}
}
