/* @flow */

import { takeLatest } from 'redux-saga';
import { put } from 'redux-saga/effects';

export default function *navigationSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('INITIALIZE_STATE', function *() {
		yield put({
			type: 'SET_NAVIGATION',
		});
	});
}
