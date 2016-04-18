import { bus, Constants, cache } from '../../core-base';
import Counter from '../../lib/counter';

function validateTime (changes, next) {
	if (!changes.entities) return next();
	const counter = new Counter(),
		now = Date.now();

	for (const id in changes.entities) {
		const entity = changes.entities[id];

		counter.inc();
		cache.getEntity(id, (err, result) => {
			if (err) {
				counter.err(err);
				return;
			}

			console.log("Getting: ", id, result);
			if (result) {
				entity.createTime = result.createTime;
			} else {
				entity.createTime = now;
			}

			entity.updateTime = now;
			counter.dec();
		});
	}
	return counter.then(next);
}

bus.on('change', validateTime, Constants.APP_PRIORITIES.TIMES_VALIDATION1);
bus.on('change', validateTime, Constants.APP_PRIORITIES.TIMES_VALIDATION2);
