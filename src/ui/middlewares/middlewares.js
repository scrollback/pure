/* @flow */

import cacheMiddleware from './cacheMiddleware';
import shareMiddleware from './shareMiddleware';

const middlewares: Array<Function> = [
	cacheMiddleware,
	shareMiddleware,
];

export default middlewares;
