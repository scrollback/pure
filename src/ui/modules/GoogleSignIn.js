/* @flow */

import config from '../../core-client';

type AuthCode = {
    code: string;
}

export default class Google {
	static signIn(): Promise<AuthCode> {
		return new Promise(resolve => {
			function listener({ data }) {
				if (data && data.type === 'auth' && data.provider === 'google') {
					resolve({
						code: data.code,
					});
					window.removeEventListener('message', listener);
				}
			}
			window.addEventListener('message', listener);
			window.open(config.server.protocol + '//' + config.server.host + config.google.login_url);
		});
	}

	static signOut() {
		return Promise.resolve(true);
	}

	static revokeAccess() {
		return Promise.resolve(true);
	}
}

window.googlelogin = Google.signIn;
