/* @flow */

import ReactNative from 'react-native';

const {
	AsyncStorage,
} = ReactNative;

export default class PersistentStorage {
	_id: string;

	constructor(id: string) {
		this._id = id;
	}

	setItem(key: string, data: any): Promise<void> {
		return AsyncStorage.setItem(this._getKeyWithPrefix(key), JSON.stringify(data));
	}

	getItem(key: string): Promise<any> {
		return AsyncStorage.getItem(this._getKeyWithPrefix(key)).then(JSON.parse);
	}

	removeItem(key: string): Promise<void> {
		return AsyncStorage.removeItem(this._getKeyWithPrefix(key));
	}

	_getKeyWithPrefix(key: string): string {
		return `persistent_storage:${this._id}:${key}`;
	}
}
