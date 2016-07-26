/* @flow */

import cacheMiddleware from './cacheMiddleware';

const middlewares: Array<Function> = [
	cacheMiddleware,
];

export default middlewares;
