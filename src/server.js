import express from "express";
import * as Init from "./logica/init";
import Router from "./router/index.pages.js";
import Banco from "./infra/pg";
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser')

// Banco.setDatabase("database","postgres","postgres");


var server = express();
server.use(express.static('./public/'));
server.use(express.static('../assets/'));

server.use(fileUpload({
	limits: {
		fileSize: 50 * 1024 * 1024 * 10,
		safeFileNames: true
	},
}));
server.use(bodyParser({
	limit: '50mb'
}))

server.use('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
	res.header("Access-Control-Allow-Headers", "x-request-id,Content-Type,Accept", );
	return next();
});

// var tokens = {
// 	"89d40b8b3d404bb53bjhe443b65b14": true
// };

// server.use('/v1/*', function(req, res, next) {
// 	if (req.method == "OPTIONS") {
// 		return next();
// 	}
// 	if (req.headers && req.headers['x-request-id'] && tokens[req.headers['x-request-id']]) {
// 		return next();
// 	} else {
// 		res.send({
// 			erro: "token"
// 		});
// 	}
// });


Init.start(server);
new Router(server)



server.listen(7000);