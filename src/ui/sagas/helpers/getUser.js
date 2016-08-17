/* @flow */

import store from '../../../modules/store/store';
import type { User } from '../../../lib/schemaTypes';

export default function getUser(): Promise<User> {
	return new Promise((resolve, reject) => {
		const subscription = store.observe({ type: 'me' }).subscribe({
			next(user) {
				if (user) {
					resolve(user);
					subscription.unsubscribe();
				}
			},

			error(err) {
				reject(err);
				subscription.unsubscribe();
			},
		});
	});
}
