/* @flow */

import { bus, cache } from '../../core-base';
import { APP_PRIORITIES } from '../../lib/Constants';
import promisify from '../../lib/promisify';

const getEntityAsync = promisify(cache.getEntity.bind(cache));

async function validateTime(changes, next) {
	/* eslint-disable array-callback-return */
	if (!changes.entities) {
		next();
		return;
	}

	let now = Date.now();

	const promises = Object.keys(changes.entities).map(async id => {
		const entity = changes.entities[id];
		if (!entity) {
			delete changes.entities[id];
			return;
		}

		const result = await getEntityAsync(id);

		now++;

		entity.createTime = now;
		entity.updateTime = now;

		if (result) {
			entity.createTime = result.createTime;
			// if only counts changed, retain the old updateTime
			// if counts.children changed, don't retain the old updateTime
			if (Object.keys(entity).length === 1 && (entity.counts && !('children' in entity.counts))) {
				entity.updateTime = result.updateTime;
				if (entity.createTime === entity.updateTime) {
					// ensure we don't make createTime equal to updateTime
					// otherwise it'll trigger a insert in database
					entity.updateTime++;
				}
			}
		}
	});

	await Promise.all(promises);

	next();
}

bus.on('change', validateTime, APP_PRIORITIES.TIMES_VALIDATION1);
bus.on('change', validateTime, APP_PRIORITIES.TIMES_VALIDATION2);
bus.on('change', validateTime, APP_PRIORITIES.TIMES_VALIDATION3);
