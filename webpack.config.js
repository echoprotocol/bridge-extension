require('babel-polyfill');

const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const packageJson = require('./package.json');

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

const publicPath = process.env.EXTENSION ? './' : '/';
const pathToPack = process.env.EXTENSION ? path.resolve('build/src') : path.resolve('dist');
const pathsToClean = process.env.EXTENSION ? ['build'] : ['dist'];

const inpageConfig = {
	name: 'inpageConfig',
	optimization: {
		minimize: false, // <---- disables uglify.
		minimizer: [new UglifyJsPlugin()], // if you want to customize it.
	},
	entry: {
		inpage: path.resolve('extension/inpage.js'),
	},
	output: {
		publicPath,
		path: pathToPack,
		filename: '[name].js',
		pathinfo: process.env.NODE_ENV === 'local',
		sourceMapFilename: '[name].js.map',
		chunkFilename: '[name].bundle.js',
	},
	devtool: 'inline-source-map', // process.env.NODE_ENV !== 'local' ? 'cheap-module-source-map' : 'eval',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				},
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
		extractSass,
		new webpack.DefinePlugin({
			NODE_ENV: JSON.stringify(process.env.NODE_ENV),
			VERSION: JSON.stringify(packageJson.version),
			EXTENSION: !!process.env.EXTENSION,
		}),
	],
	node: {
		fs: 'empty',
		net: 'empty',
		tls: 'empty',
	},
};

const buildConfig = {
	dependencies: ['inpageConfig'],
	optimization: {
		minimize: false, // <---- disables uglify.
		minimizer: [new UglifyJsPlugin()], // if you want to customize it.
	},
	entry: {
		app: path.resolve('src/index.js'),
		content: path.resolve('extension/contentscript.js'),
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
	devtool: 'inline-source-map', // process.env.NODE_ENV !== 'local' ? 'cheap-module-source-map' : 'eval',
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
			{
				test: /inpage\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'raw-loader',
				},
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
		HTMLWebpackPluginConfig,
		extractSass,
		new webpack.DefinePlugin({
			NODE_ENV: JSON.stringify(process.env.NODE_ENV),
			VERSION: JSON.stringify(packageJson.version),
			EXTENSION: !!process.env.EXTENSION,
			INPAGE_PATH_PACK_FOLDER: JSON.stringify(process.env.EXTENSION ? 'build/src' : 'dist'),
		}),
		new CopyWebpackPlugin([
			{
				from: 'config/manifest.json',
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

module.exports = [inpageConfig, buildConfig];
