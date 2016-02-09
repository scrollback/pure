/*
	for singletons.
		* bus
		* cache
		* log
		* config		
*/

var bus = new (require("ebus"))(),
	cache = new (require("sbcache")()),
	constants = require("./lib/constants.json");

module.exports = {
	bus: bus,
	config: {},
	cache: cache,
	const: constants
};