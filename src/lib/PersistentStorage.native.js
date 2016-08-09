/* @flow */

import ReactNative from 'react-native';

const {
	AsyncStorage,
} = ReactNative;


function getInstance(id: string) {

	const getKeyWithPrefix = (key: string) => {
		return `persistent_storage:${id}:${key}`;
	};

	return {
		setItem(key: string, data: any): Promise<void> {
			return AsyncStorage.setItem(getKeyWithPrefix(key), JSON.stringify(data));
		},

		getItem(key: string): Promise<any> {
			return AsyncStorage.getItem(getKeyWithPrefix(key)).then(JSON.parse);
		},

		removeItem(key: string): Promise<void> {
			return AsyncStorage.removeItem(getKeyWithPrefix(key));
		},
	};
}

export default { getInstance };
