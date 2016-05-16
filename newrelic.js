/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */

import { config } from './src/core-server';

if (config.newrelic.key) {
	console.log('Starting newrelic.');
	exports.config = {
		app_name: config.newrelic.name || 'Scrollback',
		license_key: config.newrelic.key,
		logging: {
			level: 'info'
		},
		rules: {
			ignore: [
				'^/engine.io'
			],
			name: [
				{ pattern: '/me', name: '/me' },
				{ pattern: '/i/.*', name: '/i/*' },
				{ pattern: '/s/.*', name: '/s/*' },
				{ pattern: '/r/.*', name: '/r/*' },
				{ pattern: /^\/([\w\-]{3,32})\/.*/, name: '/:room/:discussion' },
				{ pattern: /^\/([\w\-]{3,32})$/, name: '/:room' }
			]
		}
	};
}
