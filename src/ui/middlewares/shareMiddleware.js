/* @flow */

import {
	Linking,
} from 'react-native';
import { ShareDialog } from 'react-native-fbsdk';
import Share from '../modules/Share';
import { convertRouteToURL } from '../../lib/Route';
import { config } from '../../core-client';
import type { Route } from '../../lib/RouteTypes';

type Action = {
	type: 'SHARE_LINK' | 'SHARE_FACEBOOK' | 'SHARE_TWITTER' | 'SHARE_WHATSAPP';
	payload: {
		title: string;
		route?: Route;
		text?: string;
		image?: string;
		url?: string;
		hashtags?: Array<string>;
	}
}

export default async function(action: Action) {
	switch (action.type) {
	case 'SHARE_LINK': {
		const { title, route, url, text } = action.payload;

		const parts = [];

		if (text) {
			parts.push(text);
		}

		if (url) {
			parts.push(url);
		} else if (route) {
			parts.push(config.server.protocol + '//' + config.server.host + convertRouteToURL(route));
		}

		const shareText = parts.join('\n');

		Share.shareItem(title, shareText);
		break;
	}
	case 'SHARE_FACEBOOK': {
		const { image, text, url, route } = action.payload;

		let contentUrl;

		if (route) {
			contentUrl = config.server.protocol + '//' + config.server.host + convertRouteToURL(route);
		} else if (url) {
			contentUrl = url;
		} else {
			contentUrl = config.server.protocol + '//' + config.server.host;
		}

		const contentDescription = text;
		const imageURL = image;

		const shareLinkContent = {
			contentType: 'link',
			contentUrl,
			contentDescription,
			imageURL,
		};

		const canShow = await ShareDialog.canShow(shareLinkContent);

		if (canShow) {
			await ShareDialog.show(shareLinkContent);
		} else {
			Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(contentUrl)}`);
		}
		break;
	}
	case 'SHARE_TWITTER': {
		const { text, url, route, hashtags } = action.payload;

		let link = 'http://twitter.com/intent/tweet?';

		if (text) {
			link += `text=${encodeURIComponent(text)}&`;
		}

		if (url) {
			link += `url=${encodeURIComponent(url)}&`;
		} else if (route) {
			link += `url=${encodeURIComponent(config.server.protocol + '//' + config.server.host + convertRouteToURL(route))}&`;
		}

		if (hashtags) {
			link += `url=${encodeURIComponent(hashtags.join(','))}&`;
		}

		link += 'via=belongchat';

		Linking.openURL(link);
		break;
	}
	case 'SHARE_WHATSAPP': {
		const { text, url, route } = action.payload;

		const parts = [];

		if (text) {
			parts.push(text);
		}

		if (url) {
			parts.push(url);
		} else if (route) {
			parts.push(config.server.protocol + '//' + config.server.host + convertRouteToURL(route));
		}

		const shareText = parts.join('\n');

		Linking.openURL(`whatsapp://send?text=${encodeURIComponent(shareText)}`);
		break;
	}
	}
};
