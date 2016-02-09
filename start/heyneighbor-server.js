"use strict";
/*
require("source-map-support").install();*/
require("babel-register");
require("babel-polyfill");

const core = require("../core"),
	jsonop = require("jsonop"),
	defaults = {};

let config;

try {
	config = require("../config/server");
} catch (e) {
	config = {};
	console.log(e);
}
console.log(config);
core.config = jsonop(defaults, config);

require("./../modules/socket/socket-server");

// Auth modules
require("./../modules/facebook/facebook");
require("./../modules/google/google");
require("./../modules/session/session");
require("./../modules/signin/signin");
require("./../modules/signup/signup");

/*###########*/
require("./../modules/count/count");
require("./../modules/note/note");
require("./../modules/upload/upload");

// require("./../modules/ui/ui-server");
require("./../modules/http/http"); // if fired before socket server then the http/init listener might not be listening..

require("./../modules/email/email-daemon");