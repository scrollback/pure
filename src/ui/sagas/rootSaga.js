/* @flow */

import cacheSaga from './cacheSaga';
import ctaSaga from './ctaSaga';
import locationSaga from './locationSaga';
import navigationSaga from './navigationSaga';
import notesSaga from './notesSaga';
import openLinkSaga from './openLinkSaga';
import shareSaga from './shareSaga';
import signoutSaga from './signoutSaga';

export default function *rootSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield [
		cacheSaga(),
		ctaSaga(),
		locationSaga(),
		navigationSaga(),
		notesSaga(),
		openLinkSaga(),
		shareSaga(),
		signoutSaga(),
	];
}
