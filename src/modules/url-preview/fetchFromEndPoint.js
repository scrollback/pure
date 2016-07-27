/* @flow */
import 'isomorphic-fetch';
import providers from './providers';

export default async function fetchFromEndpoint(url: string) {
	let endpoint;
	for (let i = 0, l = providers.length; i < l; i++) {
		const provider = providers[i];

		if (provider[0].test(url)) {
			endpoint = provider[1] + '?format=json&maxheight=240&url=' + encodeURIComponent(url);
		}

		if (endpoint) break;
	}
	if (!endpoint) throw new Error('NO_ENDPOINT_FOR_THIS_URL');
	return fetch(endpoint).then(res => res.json());
}
