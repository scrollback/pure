/* @flow */

import oEmbedStorage from './oEmbedStorage';
import getContentType from './getContentType';
import regexes from './regexes';
import providers from './providers';
import type { Embed } from './oEmbedTypes';

function getProperty(prop: string, type: ?string): RegExp {
	if (typeof type === 'string') {
		return new RegExp("<meta[^>]*property[ ]*=[ ]*['|\"]og:" + type + ':' + prop + "['|\"][^>]*[>]", 'i');
	}

	return new RegExp("<meta[^>]*property[ ]*=[ ]*['|\"]og:" + prop + "['|\"][^>]*[>]", 'i');
}

function getContent(regex) {
	return regex[0].match(regexes.content)[0].match(/['|"].*/)[0].slice(1);
}

function decodeText(text) {
	return text
	.replace(/&lt;/g, '<')
	.replace(/&gt;/g, '>')
	.replace(/&amp;/g, '&')
	.replace(/&quot;/g, '"')
	.replace(/&nbsp;/g, ' ')
	.replace(/&#(x?)(\d+);/g, (m, p1, p2) => String.fromCharCode(((p1 === 'x') ? parseInt(p2, 16) : p2)));
}

function parseHTML(body): ?Embed {
	const data: Embed = {
		type: 'link',
	};

	const props = [ 'title', 'description' ];

	for (let i = 0; i < props.length; i++) {
		const match = body.match(getProperty(props[i]));

		if (match && match.length) {
			data[props[i]] = decodeText(getContent(match));
		}
	}

	const propsWithType = [ 'width', 'height' ];

	for (let i = 0; i < propsWithType.length; i++) {
		const types = [ 'video', 'image' ];

		for (let j = 0; j < types.length; j++) {
			const match = body.match(getProperty(propsWithType[i], types[j]));

			if (match && match.length) {
				data['thumbnail_' + propsWithType[i]] = parseInt(getContent(match), 10);
			}
		}
	}

	const imageUrl = body.match(regexes.image);

	if (imageUrl) {
		data.thumbnail_url = getContent(imageUrl);
	}

	if (!data.title) {
		const matches = body.match(regexes.title);

		if (matches && matches.length) {
			const title = matches[0].match(/[>][^<]*/);

			if (title && title.length) {
				data.title = decodeText(title[0].slice(1));
			}
		}
	}

	if (!data.description) {
		const matches = body.match(regexes.description);

		if (matches && matches.length) {
			const description = matches[0].match(regexes.content)[0].match(/['|"][^'|^"]*/);

			if (description && description.length) {
				data.description = decodeText(description[0].slice(1));
			}
		}
	}

	if (Object.keys(data).length > 1) {
		return data;
	}

	return null;
}

function extractLink(body) {
	const res = body.match(regexes.link);

	if (res && res.length) {
		return res[0].match(/http[s]?:\/\/[^"']*/i)[0].replace(/&amp;/g, '&');
	}

	return null;
}

async function fetchData(url: string): Promise<Embed> {
	const body = await fetch(url).then(res => res.text()).then(text => text.replace(/(\r\n|\n|\r)/g, ''));
	const dataUrl = extractLink(body);

	let data;

	if (dataUrl) {
		data = await (await fetch(dataUrl)).json();
	} else {
		data = parseHTML(body);
	}

	if (data) {
		oEmbedStorage.set(url, data);
		return data;
	} else {
		throw new Error('Failed to get data from HTML');
	}
}

export default async function(url: string): Promise<Embed> {
	if (typeof url !== 'string') {
		throw new TypeError('URL must be a string');
	}

	if (!/^https?:\/\//i.test(url)) {
		throw new Error("URL must start with 'http://' or 'https://'");
	}

	const json = await oEmbedStorage.get(url);

	if (json) {
		return json;
	}

	let endpoint;

	for (let i = 0, l = providers.length; i < l; i++) {
		const provider = providers[i];

		if (provider[0].test(url)) {
			endpoint = provider[1] + '?format=json&maxheight=240&url=' + encodeURIComponent(url);
		}
	}

	if (endpoint) {
		const data = await fetch(endpoint).then(res => res.json());

		oEmbedStorage.set(url, data);

		return data;
	}

	const contentType = await getContentType(url);

	if (contentType) {
		if (contentType.indexOf('image') > -1) {
			return {
				type: 'link',
				thumbnail_url: url,
			};
		} else if (contentType.indexOf('text/html') > -1) {
			return fetchData(url);
		}
	}

	throw new Error('No oEmbed data found for ' + url);
}
