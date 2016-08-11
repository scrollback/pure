/* @flow */

import { takeLatest } from 'redux-saga';
import { put } from 'redux-saga/effects';
import store from '../../modules/store/store';
import InstallTracker from '../modules/InstallTracker';
import type { User } from '../../lib/schemaTypes';

function getUser(): Promise<User> {
	return new Promise((resolve, reject) => {
		const subscription = store.observe({ type: 'me' }).subscribe({
			next(user) {
				if (user) {
					resolve(user);
					subscription.unsubscribe();
				}
			},

			error(err) {
				reject(err);
				subscription.unsubscribe();
			},
		});
	});
}

export default function *installTrackerSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('INITIALIZE_STATE', function *() {
		const user: any = yield getUser();

		if (user.params && user.params.installReferrer) {
			return;
		}

		try {
			const campaignName = yield InstallTracker.getCampaignName();
			const campaignTerm = yield InstallTracker.getCampaignTerm();
			const campaignMedium = yield InstallTracker.getCampaignMedium();
			const campaignSource = yield InstallTracker.getCampaignSource();
			const campaignContent = yield InstallTracker.getCampaignContent();

			if (campaignName || campaignTerm || campaignMedium || campaignSource || campaignContent) {
				yield put({
					type: 'CHANGE',
					payload: {
						entities: {
							[user.id]: {
								...user,
								params: {
									...user.params,
									installReferrer: {
										campaignName,
										campaignTerm,
										campaignMedium,
										campaignSource,
										campaignContent,
									},
								},
							},
						},
					},
				});
			}
		} catch (e) {
			// ignore
		}
	});
}
