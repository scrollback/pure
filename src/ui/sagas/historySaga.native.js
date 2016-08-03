/* @flow */

import { Linking } from 'react-native';
import { takeLatest } from 'redux-saga';
import { put } from 'redux-saga/effects';
import isShortURL from '../../modules/url-shortener/isShortURL';
import expandURL from '../../modules/url-shortener/expandURL';

export default function *historySaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('INITIALIZE_STATE', function *() {
		let initialURL;
		try {
			initialURL = yield Linking.getInitialURL();
			if (initialURL && isShortURL(initialURL)) {
				initialURL = yield expandURL(initialURL);
			}
		} catch (e) {
			initialURL = null;
		}
		yield put({
			type: 'SET_INITIAL_URL',
			payload: initialURL,
		});
	});
}
