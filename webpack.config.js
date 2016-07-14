/* eslint-disable import/no-commonjs */

const __DEV__ = process.env.NODE_ENV !== 'production';

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const plugins = [
	new LodashModuleReplacementPlugin(),
	new webpack.EnvironmentPlugin('NODE_ENV'),
	new webpack.DefinePlugin({
		__DEV__: JSON.stringify(__DEV__)
	}),
	new webpack.LoaderOptionsPlugin({
		minimize: !__DEV__,
		debug: __DEV__,
	}),
];

const entry = [
	'./index.web.js',
];

const babelrc = JSON.parse(fs.readFileSync(path.join(__dirname, '.babelrc.web.json'), 'utf-8').toString());

module.exports = {
	devtool: 'source-map',
	entry: __DEV__ ? [ ...entry, 'webpack-hot-middleware/client' ] : [ ...entry ],
	output: {
		path: path.resolve(__dirname, 'static/dist/'),
		publicPath: '/s/dist/',
		filename: 'scripts/bundle.min.js',
		sourceMapFilename: 'scripts/bundle.min.js.map',
	},
	plugins: plugins.concat(__DEV__ ? [
		new webpack.HotModuleReplacementPlugin(),
	] : [
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin(),
	]),
	resolve: {
		extensions: [ '', '.js', ],
	},
	module: {
		preLoaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'eslint?quiet=true',
			},
		],
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel',
				query: Object.assign({}, babelrc, {
					presets: babelrc.presets.map(p => p.startsWith('es2015') ? 'es2015-native-modules' : p),
					env: {
						developement: {
							presets: [ 'react-hmre' ],
						},
					},
				}),
			},
			{
				test: /\.(gif|jpe?g|png|svg)$/,
				loader: 'url-loader',
				query: {
					limit: 10000,
					name: 'assets/[name].[hash:16].[ext]',
				},
			},
			{
				test: /\.json$/,
				loader: 'json',
			},
		],
	},
};
