/* @flow */

import { takeEvery } from 'redux-saga';
import { bus } from '../../core-client';
import getChangeFromAction from './helpers/getChangeFromAction';

export default function *cacheSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeEvery('*', action => {
		const change = getChangeFromAction(action);
		if (change) {
			bus.emit('change', change);
		}
	});
}
