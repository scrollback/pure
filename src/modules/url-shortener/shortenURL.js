/* @flow */

import { config } from '../../core-client';

const { protocol, host } = config.server;

export default async function shortenURL(url: string) {
	const response = await fetch(protocol + '//' + host + '/x/url-shortener/shorten?url=' + encodeURIComponent(url));
	const path = await response.text();

	return path;
}
