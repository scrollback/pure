/* @flow */

export default function extractPath(url: string): string {
	return url.replace(/^https?:\/\/[^\/]+\//, '').replace(/\?.+$/, '');
}
