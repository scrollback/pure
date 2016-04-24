import { bus, Constants, cache } from '../../core-base';
import Counter from '../../lib/counter';

function validateTime(changes, next) {
	let i = 0;
	if (!changes.entities) return next();
	const counter = new Counter(),
		now = Date.now();

	for (const id in changes.entities) {
		const entity = changes.entities[id];

		counter.inc();
		cache.getEntity(id, (err, result) => { // eslint-disable-line no-loop-func
			if (err) {
				counter.err(err);
				return;
			}

			i++;
			if (result) {
				entity.createTime = result.createTime;
			} else {
				entity.createTime = now + i;
			}

			entity.updateTime = now + i;
			counter.dec();
		});
	}
	return counter.then(next);
}

bus.on('change', validateTime, Constants.APP_PRIORITIES.TIMES_VALIDATION1);
bus.on('change', validateTime, Constants.APP_PRIORITIES.TIMES_VALIDATION2);
