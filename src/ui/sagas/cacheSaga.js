/* @flow */

import { takeEvery } from 'redux-saga';
import { bus } from '../../core-client';
import getChangeFromAction from './helpers/getChangeFromAction';

export default function *cacheSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeEvery([
		'CHANGE',
		'AUTH',
		'SIGNUP',
		'LOG_EVENT',
	], action => bus.emit('change', getChangeFromAction(action)));
}
