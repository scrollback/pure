/* @flow */
import fetchFromEndPoint from './fetchFromEndPoint';
import fetchFromMetaData from './fetchFromMetaData';

const strategies = [
	fetchFromEndPoint,
	fetchFromMetaData
];

export default async function (url: string) {
	if (!/^https?:\/\//i.test(url)) {
		throw new Error('INVALID_URL');
	}

	let preview;
	for (let i = 0; i < strategies.length; i++) {
		try {
			preview = await strategies[i](url); // eslint-disable-line babel/no-await-in-loop
		} catch (e) {
			preview = null;
		}

		if (preview) return preview;
	}
	throw new Error('NO_PREVIEW_AVAILABLE');
}
