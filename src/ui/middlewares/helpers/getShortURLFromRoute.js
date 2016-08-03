/* @flow */

import shortenURL from '../../../modules/url-shortener/shortenURL';
import { convertRouteToURL } from '../../../lib/Route';
import { config } from '../../../core-client';
import type { Route } from '../../../lib/RouteTypes';

const { protocol, host } = config.server;

export default async function getShortURLFromRoute(route: Route, medium: string): Promise<string> {
	let url = protocol + '//' + host + convertRouteToURL(route);
	const utm = 'utm_source=android_app&utm_medium=' + medium;

	if (url.includes('?')) {
		url += '&' + utm;
	} else {
		url += '?' + utm;
	}

	try {
		return await shortenURL(url);
	} catch (e) {
		return url;
	}
}
