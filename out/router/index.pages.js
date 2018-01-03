"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require("request");

var Router = function Router(server) {
	_classCallCheck(this, Router);

	server.get("/", function (req, res) {
		res.send("Hello World Index");
	});

	server.get("/home", function (req, res) {
		res.send("Hello World Index");
	});
};

exports["default"] = Router;
module.exports = exports["default"];