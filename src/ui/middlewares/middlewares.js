/* @flow */

import cacheMiddleware from './cacheMiddleware';
import shareMiddleware from './shareMiddleware';
import signoutMiddleware from './signoutMiddleware';

const middlewares: Array<Function> = [
	cacheMiddleware,
	shareMiddleware,
	signoutMiddleware,
];

export default middlewares;
