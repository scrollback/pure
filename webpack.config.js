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
		debug: __DEV__
	}),
];

const entry = [
	'./src/ui/Client',
];

const babelrc = JSON.parse(fs.readFileSync(path.join(__dirname, '.babelrc.web.json'), 'utf-8').toString());

module.exports = {
	devtool: 'source-map',
	entry: __DEV__ ? [ ...entry, 'webpack-hot-middleware/client' ] : [ ...entry ],
	output: {
		path: path.resolve(__dirname, 'static/dist/scripts'),
		publicPath: '/s/dist/scripts/',
		filename: 'bundle.min.js',
		sourceMapFilename: 'bundle.min.js.map'
	},
	plugins: plugins.concat(__DEV__ ? [
		new webpack.HotModuleReplacementPlugin(),
	] : [
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin()
	]),
	resolve: {
		extensions: [ '', '.web.js', '.js', ],
	},
	module: {
		preLoaders: [
			{
				test: /\.js$/,
				loader: 'eslint?quiet=true',
				exclude: /node_modules/
			}
		],
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel',
				exclude: /node_modules/,
				query: Object.assign({}, babelrc, {
					presets: babelrc.presets.map(p => p.startsWith('es2015') ? 'es2015-native-modules' : p),
					env: {
						developement: {
							presets: [ 'react-hmre' ],
						},
					}
				})
			},
			{
				test: /\.(gif|jpe?g|png|svg)$/,
				loader: 'url-loader',
				query: { name: '[name].[hash:16].[ext]' }
			},
			{
				test: /\.json$/,
				loader: 'json'
			}
		]
	}
};
