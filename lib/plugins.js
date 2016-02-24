'use strict';

var path = require('path');
var debug = require('debug');
var utils = require('./utils');
var flatten = require('flatten');
var readPkgUp = require('read-pkg-up');
var _ = debug('fly:plugins');
var x = module.exports;

/**
 * Takes a `flyfile` then reads & load fly-related plugins.
 *
 * @param  {String} flyfile 	The main `flyfile.js` path
 * @param  {Function} hook 		The function to bind plugins to main Fly instance
 * @return {Array}      			Array of existent & loaded plugins
 */
x.load = function (flyfile, hook) {
	hook = hook || utils.bind;
	// hook(null, {presets: ['es2015', 'stage-0'], only: [/fly-[-\w]+\/[-\w]+\./, /[fF]lyfile\.js/] })

	_('beginning to look for plugins');

	// `flyfile` should also be in project's root
	var rootDir = path.dirname(flyfile);

	// read the `package.json` closest to / within same dir as `flyfile.js`
	var pkg = x.find(rootDir);

	// parse & load all plugins
	return x.parse(pkg, function (name) {
		return {
			name: name,
			plugin: req(path.join(rootDir, 'node_modules', name))
		};
	});
};

/**
 * Find a sibling `package.json` file & return its content.
 * @param  {String} dir 	The directory to start looking
 * @return {Object}     	The file's contents
 */
x.find = function (dir) {
	return readPkgUp.sync({cwd: dir}).pkg;
	// error catching
};

/**
 * Attempt to dynamically `require()` a file or package
 * @param  {String} name 	The dep-name or filepath to require.
 */
function req(name) {
	try {
		return require(name);
	} catch (e) {
		utils.alert(e.message);
	}
}

/**
 * Parse `package.json` for a list of Fly-related plugins,
 * then bind them to the Fly instance using a `loader`.
 *
 * @param {Object} 		pkg 				The `package.json` contents
 * @param {Function} 	loader 			The function 'hook' to bind each plugin
 * @param {Array} 		blacklist 	The plugins to NOT load
 * @return {Array}  							Flattened (single) array of plugins
 */
x.parse = function (pkg, loader, blacklist) {
	blacklist = blacklist || [];

	_('parse fly-* plugins from `package.json`');

	// all declared dependencies
	var all = ['dependencies', 'devDependencies', 'peerDependencies']
		.filter(function (key) {
			return key in pkg;
		}).map(function (dep) {
			return Object.keys(pkg[dep]);
		});

	return flatten(all).filter(function (dep) {
		// filter down to `fly-` related deps only & ensure NOT in `blacklist`
		return /^fly-[-\w]+/g.test(dep) && blacklist.indexOf(dep) === -1;
	}).reduce(function (prev, next) {
		return prev.concat(loader(next));
	}, []);
};