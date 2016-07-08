/* flow */
/* eslint-disable no-console, no-param-reassign */

import { urlTos3 } from '../src/lib/upload';
import { bus, config } from '../src/core-server';
import { TYPE_USER } from '../src/lib/Constants';
import buildAvatarURLForSize from '../src/lib/buildAvatarURLForSize';
import promisify from '../src/lib/promisify';
import winston from 'winston';
import * as pg from '../src/lib/pg';

type User = {
	id: string;
	meta: {
		picture: string
	};
	params: {
		picture: string
	}
};

const IMAGE_NAME = 'avatar';
const performReadQuery = promisify(pg.read.bind(pg, config.connStr));

const uploadImageHelper = async (user: Array<User>, propName: string) => {
	await urlTos3(buildAvatarURLForSize(user[propName].picture, 1024), 'a/' + user.id + '/' + IMAGE_NAME);
	const changes = {
		entities: {
			[user.id]: {
				type: TYPE_USER,
				id: user.id,
				[propName]: {
					picture: [ '$delete' ]
				}
			}
		}
	};
	bus.emit('change', changes);
};

const uploadNextImage = async (users: Array<User>, index = 0: number) => {
	if (index >= users.length) {
		return;
	} else {
		if (users[index].params && users[index].params.picture) {
			await uploadImageHelper(users[index], 'params');
		} else if (users[index].meta && users[index].meta.picture) {
			await uploadImageHelper(users[index], 'meta');
		}
		uploadNextImage(users, ++index);
	}
};

export const avatarUploader = async (updateTime = 1000000000000: number) => {
	try {
		const users = await performReadQuery({
			$: 'SELECT id, meta, params FROM users WHERE updatetime > &{updateTime}',
			updateTime
		});
		await uploadNextImage(users);
	} catch (e) {
		winston.error(`something went wrong while uploading user avatars, ${e}`);
	}
};
