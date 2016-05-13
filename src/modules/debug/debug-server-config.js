/* @flow */

import jsonop from 'jsonop';
import defaults from '../../../config/debug-server-defaults.json';

console.log("Server debug conflicts: ", defaults);
let config = defaults;

try {
	config = jsonop(config, require('../../../config/debug-server.json'));
	console.log("final config", config);
} catch (e) {
	console.log("error: ", e.message);
	// ignore
}

export default config;
