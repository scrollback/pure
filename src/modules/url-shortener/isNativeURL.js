/* @flow */

import { config } from '../../core-client';

const { host } = config.server;

export default function isNativeURL(url: string): boolean {
	return url.indexOf('http://' + host) > -1 || url.indexOf('https://' + host) > -1;
}
