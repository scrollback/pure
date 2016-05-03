import { cache } from '../../../core-server';
import { ROLE_BANNED } from '../../../lib/Constants';

export default function(user, entity) {
	return new Promise((resolve, reject) => {
		cache.getRelation(user, entity, (err, relation) => {
			if (err) return reject(err);
			if (relation.role === ROLE_BANNED) return reject('banned');
			return resolve();
		});
	});
}
