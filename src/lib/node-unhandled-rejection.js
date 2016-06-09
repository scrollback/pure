/* @flow */
/* eslint-disable no-console */

process.on('unhandledRejection', (reason) => {
	console.error('\x1b[31m', 'Uncaught (in promise)', reason.stack || reason, '\x1b[0m');
});
