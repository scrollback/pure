/* @flow */

import PersistentStorage from '../../lib/PersistentStorage';
import type { Embed } from './oEmbedTypes';

const oEmbedStorage = new PersistentStorage('oembed');

let data;

export default {
	async _readData(): Promise<void> {
		const dataString = await oEmbedStorage.getItem('data');

		if (dataString) {
			data = JSON.parse(dataString);
		} else {
			data = [];
		}
	},

	_findItem(key: string): ?Embed {
		for (let i = 0, l = data.length; i < l; i++) {
			if (data[i] && data[i].url === key) {
				return data[i].json;
			}
		}

		return null;
	},

	async set(url: string, json: Embed): Promise<void> {
		const item = await this.get(url);

		if (item) {
			item.json = json;
		} else {
			data.push({
				url,
				json,
			});
		}

		if (data.length >= 100) {
			data.splice(0, 10);
		}

		return oEmbedStorage.setItem('data', JSON.stringify(data));
	},

	async get(url: string): Promise<?Embed> {
		if (!data) {
			await this._readData();
		}

		return this._findItem(url);
	},

};
