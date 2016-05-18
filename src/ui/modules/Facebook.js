import { config } from '../../core-client';

type AuthCode = {
	code: string;
}

export default class Facebook {
	static logInWithReadPermissions(): Promise<AuthCode> {
		return new Promise(resolve => {
			function listener({ data }) {
				if (data && data.type === 'auth' && data.provider === 'facebook') {
					resolve({
						code: data.code,
					});
					window.removeEventListener('message', listener);
				}
			}
			window.addEventListener('message', listener);
			window.open(config.server.protocol + '//' + config.server.host + config.facebook.login_url);
		});
	}
}


window.facebooklogin = Facebook.logInWithReadPermissions;
