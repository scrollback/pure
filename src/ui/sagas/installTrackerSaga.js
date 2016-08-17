/* @flow */

import { takeLatest } from 'redux-saga';
import { put } from 'redux-saga/effects';
import InstallTracker from '../modules/InstallTracker';
import getUser from './helpers/getUser';

export default function *installTrackerSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('INITIALIZE_STATE', function *() {
		const user: any = yield getUser();

		if (user.params && user.params.installReferrer) {
			return;
		}

		try {
			const androidID = yield InstallTracker.getAndroidID();

			if (!androidID) {
				return;
			}

			yield put({
				type: 'CHANGE',
				payload: {
					entities: {
						[user.id]: {
							...user,
							params: {
								...user.params,
								androidID,
							},
						},
					},
				},
			});
		} catch (e) {
			// ignore
		}
	});
}
