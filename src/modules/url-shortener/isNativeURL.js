/* @flow */

export default function isNativeURL(url: string, host: string): boolean {
	return url.indexOf('http://' + host) === 0 || url.indexOf('https://' + host) === 0;
}
