/* @flow */

function replaceParams(u, params) {
	let link = u.replace(/(&|\?)(.+=.+)*/g, '');

	for (const q in params) {
		if (params[q]) {
			link += ((/\?(.*=.*)*/).test(link) ? '&' : '?') + q + '=' + params[q];
		}
	}

	return link;
}

export default function buildAvatarURLForSize(url: string, size: number = 24): string {
	if (/https?\:\/\/.*\.googleusercontent\.com\//.test(url)) {
		return replaceParams(url, {
			sz: size,
		});
	}

	if (/https?\:\/\/graph\.facebook\.com\//.test(url)) {
		return replaceParams(url, {
			type: 'square',
			height: size,
			width: size,
		});
	}

	if (/https?\:\/\/gravatar\.com\//.test(url)) {
		return replaceParams(url, {
			size,
			d: 'retro',
		});
	}

	return replaceParams(url, { size });
}
