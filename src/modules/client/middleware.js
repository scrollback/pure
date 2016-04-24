/* @flow */

import compose from 'koa-compose';
import webpack from 'webpack';
import webpackDevMiddleware from 'koa-webpack-dev-middleware';
import webpackHotMiddleware from 'koa-webpack-hot-middleware';
import webpackConfig from '../../../webpack.config';

export default function(): Function {
	const middlewares = [];

	if (process.env.NODE_ENV !== 'production') {
		const compiler = webpack(webpackConfig);

		// Enable Webpack Dev Server
		middlewares.push(webpackDevMiddleware(compiler, {
			publicPath: webpackConfig.output.publicPath,
			noInfo: true,
		}));

		// Enable Hot reloading
		middlewares.push(webpackHotMiddleware(compiler));
	}

	return compose(middlewares);
}
