/* @flow */

import extractPath from './extractPath';

export default function isShortURL(url: string): boolean {
	return /^[A-Za-z0-9\-_]{6,7}$/.test(extractPath(url));
}
