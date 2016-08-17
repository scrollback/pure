/* @flow */

import { takeEvery } from 'redux-saga';
import { put } from 'redux-saga/effects';
import { convertURLToRoute } from '../../lib/Route';
import getUser from './helpers/getUser';

function *logLaunchSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeEvery('SET_INITIAL_URL', function *(action) {
		const user: any = yield getUser();
		const initialURL = action.payload;
		if (!initialURL) {
			return;
		}
		yield put({
			type: 'LOG_EVENT',
			payload: {
				type: 'launch',
				user: user.id,
				data: {
					url: initialURL,
					route: convertURLToRoute(initialURL),
				},
			},
		});
	});
}

export default function *analyticsSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield [
		logLaunchSaga(),
	];
}
