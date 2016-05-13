/* @flow */

import jsonop from 'jsonop';
import defaults from '../../../config/debug-client-defaults.json';

let config = jsonop({}, defaults);

try {
	config = jsonop(config, require('../../../config/debug-client.json'));
} catch (e) {
	// ignore
}
export default config;
