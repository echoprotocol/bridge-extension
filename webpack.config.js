require('babel-polyfill');

const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
	template: `${__dirname}/src/assets/index.html`,
	filename: 'index.html',
	inject: 'body',
	chunks: ['app'],
});

const extractSass = new ExtractTextPlugin({
	filename: '[name].[hash].css',
	disable: process.env.NODE_ENV === 'local',
});
const { version } = require('./package.json');

const publicPath = process.env.EXTENSION ? './' : '/';
const pathToPack = process.env.EXTENSION ? path.resolve('build/src') : path.resolve('dist');
const pathsToClean = process.env.EXTENSION ? ['build'] : ['dist'];

module.exports = {
	entry: {
		app: path.resolve('src/index.js'),
		content: path.resolve('extension/contentscript.js'),
		inpage: path.resolve('extension/inpage.js'),
		background: path.resolve('extension/background.js'),
	},
	output: {
		publicPath,
		path: pathToPack,
		filename: '[name].js',
		pathinfo: process.env.NODE_ENV === 'local',
		sourceMapFilename: '[name].js.map',
		chunkFilename: '[name].bundle.js',
	},
	devtool: process.env.NODE_ENV !== 'local' ? 'cheap-module-source-map' : 'eval',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				},
			},
			{
				test: /\.jsx$/,
				include: /src/,
				use: {
					loader: 'babel-loader',
				},
			},
			{
				test: /\.(svg|jpeg|jpg|png|ico|webmanifest)$/,
				use: {
					loader: 'file-loader',
					options: {
						name: 'images/[name].[ext]',
					},
				},
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				loader: 'url-loader?limit=100000',
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.scss$/,
				use: extractSass.extract({
					use: [{
						loader: 'css-loader',
					}, {
						loader: 'sass-loader',
					}],
					// use style-loader in development
					fallback: 'style-loader',
				}),
			},
		],
	},
	resolve: {
		modules: [
			'node_modules',
			path.resolve('src'),
		],
		extensions: ['.js', '.jsx', '.json'],
	},
	plugins: [
		new CleanWebpackPlugin(pathsToClean),
		HTMLWebpackPluginConfig,
		extractSass,
		new webpack.DefinePlugin({
			NODE_ENV: JSON.stringify(process.env.NODE_ENV),
			EXTENSION: !!process.env.EXTENSION,
		}),
		new CopyWebpackPlugin([
			{
				from: 'config/manifest.json'
			},
		]),
		new ZipPlugin({
			path: path.resolve('build/zip'),
			filename: 'echo_bridge.zip',
		}),
	],
	node: {
		fs: 'empty',
		net: 'empty',
		tls: 'empty',
	},
};
