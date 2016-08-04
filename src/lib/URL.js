/* @flow */

export function isValidURL(link: string): boolean {
	return /^((ftp|https?:\/\/)?(\S+\.\S+)+)$/i.test(link);
}

export function isValidMail(link: string): boolean {
	return /^(mailto:)?[^@]+@[^@]+\.[^@]+$/i.test(link);
}

export function isValidTel(link: string): boolean {
	return /^(tel:)?(?:\+?(\d{1,3}))?[-.\s(]*(\d{3})?[-.\s)]*(\d{3})[-.\s]*(\d{4})(?: *x(\d+))?$/.test(link);
}

export function buildLink(link: string): ?string {

	if (isValidTel(link)) {
		// a phone number
		return /^tel:/.test(link) ? link : 'tel:' + link;
	}

	if (isValidMail(link)) {
		// an email id
		return /^mailto:/.test(link) ? link : 'mailto:' + link;
	}

	if (isValidURL(link)) {
		// a normal link
		return /^(https?|ftp):\/\//.test(link) ? link : 'http://' + link;
	}

	return null;
}

export function parseURLs(text: string, count?: number): Array<string> {
	const links = [];
	const words = text.replace(/(\r\n|\n|\r)/g, ' ').split(' ');

	for (let i = 0, l = words.length; i < l; i++) {
		const url = buildLink(words[i].trim().replace(/[\.,\?!:;]+$/, ''));

		if (url && /^https?:\/\//.test(url)) {
			links.push(url);

			if (count && links.length >= count) {
				break;
			}
		}
	}

	return links;
}
