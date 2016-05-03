import { bus } from '../../core-server';
import { TYPE_THREAD } from '../../lib/Constants';
import log from 'winston';

function getScore() {
	return 1;
}

bus.on('change', (changes) => {
	if (!changes.entities) {
		return;
	}

	for (const id in changes.entities) {
		const entity = changes.entities[id];

		if (entity.type === TYPE_THREAD) {
			entity.score = getScore(entity.updateTime || Date.now());
		}

//		if (entity.type === TYPE_TEXT) {
//			const thread = changes.entities[entity.parents[0]];
//
//			thread.score = getScore(entity.createtime);
//			changes.entities[entity.parents[0]] = thread;
//		}
	}
});

log.info('Score module ready.');
