/* @flow */

import { Share } from 'react-native';
import { takeLatest } from 'redux-saga';
import getShortURLFromRoute from './helpers/getShortURLFromRoute';

export default function *shareLinkSaga(): Generator<Array<Generator<any, any, any>>, void, void> {
	yield* takeLatest('SHARE_LINK', function *(action) {
		const { title, route, url, text } = action.payload;

		const parts: Array<string> = [];

		if (text) {
			parts.push(text);
		}

		if (url) {
			parts.push(url);
		} else if (route) {
			const shortUrl = yield getShortURLFromRoute(route, 'social');
			parts.push(shortUrl || '');
		}

		const message = parts.join('\n');

		Share.share({ message }, { dialogTitle: title });
	});
}
