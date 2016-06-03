import { bus, cache } from '../../core-base';
import * as Constants from '../../lib/Constants';
import Counter from '../../lib/counter';

function validateTime(changes, next) {
	let i = 0;
	if (!changes.entities) return next();
	const counter = new Counter(),
		now = Date.now();

	for (const id in changes.entities) {
		const entity = changes.entities[id];
		if (!entity) {
			delete changes.entities[id];
			continue;
		}

		counter.inc();
		cache.getEntity(id, (err, result) => { // eslint-disable-line no-loop-func
			if (err) {
				counter.err(err);
				return;
			}

			i++;
			entity.createTime = now + i;
			entity.updateTime = now + i;
			if (result) {
				entity.createTime = result.createTime;
				if (entity.counts && !entity.counts.children) {
					// We need to retain the old updateTime...
					entity.updateTime = result.updateTime;
					if (entity.createTime === entity.updateTime) {
						// ... if it will cause postgres to do an insert, make a small
						// increment to prevent that.
						entity.updateTime++;
					}
				}
			}

			counter.dec();
		});
	}
	return counter.then(next);
}

bus.on('change', validateTime, Constants.APP_PRIORITIES.TIMES_VALIDATION1);
bus.on('change', validateTime, Constants.APP_PRIORITIES.TIMES_VALIDATION2);
bus.on('change', validateTime, Constants.APP_PRIORITIES.TIMES_VALIDATION3);
