/* @flow */

import winston from 'winston';
import { bus } from '../../core-server';
import { parseURLs } from '../../lib/URL';
import { TYPE_THREAD, TYPE_TEXT } from '../../lib/Constants';
import Thread from '../../models/thread';
import Text from '../../models/text';
import generatePreview from './generatePreview';

async function addOEmbed(id, item, links) {
	let preview;
	const type = item.type;
	for (let i = 0, l = links.length; i < l; i++) {
		try {
			winston.debug('LINKS:', links);
			preview = await generatePreview(links[i]); // eslint-disable-line babel/no-await-in-loop
			winston.debug('Preview ready', preview);

			const entity = new (type === TYPE_THREAD ? Thread : Text)({
				id,
				type,
				meta: {
					oembed: preview
				}
			});

			if (!preview.description) {
				const parts = [];
				if (preview.provider_name) parts.push('on', preview.provider_name);
				if (preview.author_name) parts.push('by', preview.author_name);
				preview.description = parts.join(' ');
			}

			winston.debug('New change:', entity);
			bus.emit('change', {
				entities: {
					[id]: entity
				}
			});
			break;
		} catch (e) {
			winston.warn('OEMBED_FETCH_FAILED:', e.message);
		}
	}
}

bus.on('postchange', change => {
	if (!change.entities) return;

	Object.keys(change.entities).forEach((id) => {
		let links = [];
		const item = change.entities[id];
		if (item.createTime !== item.updateTime) return;
		if (item.type === TYPE_TEXT) links = parseURLs(item.body, 1);
		if (item.type === TYPE_THREAD) {
			links = parseURLs(item.name);
			if (!links.length) links = parseURLs(item.body, 1);
		}
		if (links.length) addOEmbed(id, item, links);
	});
});
