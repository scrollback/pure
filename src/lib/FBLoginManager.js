/* @flow */

import { config } from '../core-client';
import { open } from './Popup';

type AuthCode = {
	code: string;
}

const url = config.server.protocol + '//' + config.server.host + config.facebook.login_url;

export default class FBLoginManager {
	static async logIn(): Promise<AuthCode> {
		let code;

		await open(url).forEach(({ data }) => {
			if (data && data.type === 'auth' && data.provider === 'facebook') {
				code = data.code;
			}
		});

		if (code) {
			return { code };
		} else {
			throw new Error('Failed to get auth token');
		}
	}

	static logOut() {
		return Promise.resolve(true);
	}
}
