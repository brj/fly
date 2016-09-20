'use strict';

const $ = {
	isEmptyObj: obj => {
		for (let x in obj) return false;
		return true;
	},

	isArray: val => Array.isArray(val),

	isObject: val => {
		return val != null && typeof val === 'object' && $.isArray(val) === false;
	},

	/**
	 * Create a Map from a simple Array
	 * @param  {Array} list
	 * @return {Map}
	 */
	arrayToMap: list => {
		const map = {}
		for (let el of list) {
			map[el] = el;
		}
		return map;
	},

	shallowCopy: (merge, value) => {
		/* use object.assign */

		// var copy = merge || {}
		// Object.keys(value).forEach(function (key) {
		// 	copy[key] = value[key]
		// })

		// return copy
	}

	// diff: require('./diff')
};

module.exports = $;