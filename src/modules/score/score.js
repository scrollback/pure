import { bus, cache } from '../../core-server';
import { TYPE_THREAD, TAG_POST_STICKY, APP_PRIORITIES } from '../../lib/Constants';
import promisify from '../../lib/promisify';
import log from 'winston';
import jsonop from 'jsonop';

const getEntityAsync = promisify(cache.getEntity.bind(cache));

export function getScore(entity) {
	let upvote = 0, children = 0, follower = 0;

	if (entity.counts) {
		upvote = typeof (entity.counts.upvote) === 'number' ? entity.counts.upvote : 0;
		children = typeof (entity.counts.children) === 'number' ? entity.counts.children : 0;
		follower = typeof (entity.counts.follower) === 'number' ? entity.counts.follower : 0;
	}

	const updateTime = entity.updateTime ? (entity.updateTime - 1.45E12) / 600000 : 0,
		createTime = entity.createTime ? (entity.createTime - 1.45E12) / 600000 : 0;

	upvote = 2 * Math.atan(upvote / 1) / Math.PI;
	children = 2 * Math.atan(children / 5) / Math.PI;
	follower = 2 * Math.atan(follower / 3) / Math.PI;
	const score = 0.7 * updateTime + 0.3 * createTime +
	10 * upvote + 5 * children + 7.5 * follower +
	1E9 * (entity.tags && entity.tags.indexOf(TAG_POST_STICKY) > -1 ? 1 : 0); // for pinned posts
	log.info('Score for thread: ', score);
	return score;
}

bus.on('change', async (changes, next) => {
	if (!changes.entities) {
		next();
		return;
	}

	try {
		const promises = [];

		for (const id in changes.entities) {
			const entity = changes.entities[id];

			if (entity.type === TYPE_THREAD) {
				promises.push(getEntityAsync(entity.id).then(result => {
					const newThread = jsonop.apply(entity, result || {});
					entity.score = getScore(newThread);
				}));
			}
		}
		await Promise.all(promises);
		next();
	} catch (e) {
		next(e);
	}
}, APP_PRIORITIES.SCORE);

log.info('Score module ready.');
