"use strict";

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _logicaInit = require("./logica/init");

var Init = _interopRequireWildcard(_logicaInit);

var _routerIndexPagesJs = require("./router/index.pages.js");

var _routerIndexPagesJs2 = _interopRequireDefault(_routerIndexPagesJs);

var _infraMongo = require("./infra/mongo");

var _infraMongo2 = _interopRequireDefault(_infraMongo);

_infraMongo2["default"].setDatabase("database");

var server = (0, _express2["default"])();

Init.start(server);
new _routerIndexPagesJs2["default"](server);

server.listen(7000);