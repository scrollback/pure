/* @flow */

import client from '../client/middleware';
import { bus } from '../../core-server';

bus.on('http/init', app => {
	app.use(client());
});
