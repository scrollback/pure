/* @flow */
import 'isomorphic-fetch';

export default async function(url: string): Promise<string> {
	return fetch(url).then((response) => {
		if (response && response.status === 200) {
			return response.headers.get('content-type');
		} else {
			throw new Error('NO_CONTENT_TYPE');
		}
	});
}
