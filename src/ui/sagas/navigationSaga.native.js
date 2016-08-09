/* @flow */

import { Linking } from 'react-native';
import { takeLatest } from 'redux-saga';
import { select, put } from 'redux-saga/effects';
import { v4 } from 'node-uuid';
import { convertURLToState } from '../../lib/Route';
import isShortURL from '../../modules/url-shortener/isShortURL';
import expandURL from '../../modules/url-shortener/expandURL';
import PersistentStorage from '../../lib/PersistentStorage';

const PERSISTANCE_KEY = process.env.NODE_ENV !== 'production' ? 'FLAT_NAVIGATION_PERSISTENCE_0' : null;

function *restoreNavgationSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
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
		let navigationState;
		if (initialURL) {
			navigationState = convertURLToState(initialURL);
		} else if (PERSISTANCE_KEY) {
			const storage = PersistentStorage.getInstance(PERSISTANCE_KEY);
			navigationState = yield storage.getItem('navigation');
		}
		if (navigationState) {
			yield put({
				type: 'SET_NAVIGATION',
				payload: {
					...navigationState,
					routes: navigationState.routes.map(route => ({ ...route, key: v4() })),
				},
			});
		} else {
			yield put({
				type: 'SET_NAVIGATION',
			});
		}
	});
}

function *persistNavgationSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest([ 'PUSH_ROUTE', 'POP_ROUTE', 'SET_NAVIGATION' ], function *() {
		if (PERSISTANCE_KEY) {
			const storage = PersistentStorage.getInstance(PERSISTANCE_KEY);
			const navigationState = yield select(state => state.navigation);
			yield storage.setItem('navigation', navigationState);
		}
	});
}

export default function *navigationSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield [
		restoreNavgationSaga(),
		persistNavgationSaga(),
	];
}
