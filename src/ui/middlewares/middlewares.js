/* @flow */

import cacheMiddleware from './cacheMiddleware';
import shareMiddleware from './shareMiddleware';
import signoutMiddleware from './signoutMiddleware';
import notesMiddleware from './notesMiddleware';

const middlewares: Array<Function> = [
	cacheMiddleware,
	shareMiddleware,
	signoutMiddleware,
	notesMiddleware,
];

export default middlewares;
