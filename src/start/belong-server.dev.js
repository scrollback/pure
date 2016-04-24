#! ./node_modules/babel-cli/bin/babel-node.js

import './belong-server-base';
import winston from 'winston';

if (process.env.NODE_ENV !== 'production') {
	winston.level = 'debug';
}
