import express from "express";
import * as Init from "./logica/init";
import Router from "./router/index.pages.js";
import Banco from "./infra/pg";
var fileUpload = require("express-fileupload");
var bodyParser = require("body-parser");

import Login from "./router/login.js";
import Member from "./router/member.js";

var database = process.env.POSTGRES_DB || "postgres";
var password = process.env.POSTGRES_PASSWORD || "postgres";
var user = process.env.POSTGRES_USER || "postgres";
var host = process.env.HOST_DB || "localhost";
Banco.setDatabase(host, database, user, password);
// docker run -it --net=host  -e POSTGRES_PASSWORD=postgres -e PGDATA=/data -e POSTGRES_DB=postgres -e POSTGRES_USER=postgres  postgres
// docker run  -d -p 5432:5432  -e POSTGRES_PASSWORD=postgres -e PGDATA=/data  -e POSTGRES_DB=postgres -e POSTGRES_USER=postgres  postgres

var server = express();

server.use(
  fileUpload({
    limits: {
      fileSize: 50 * 1024 * 1024 * 10,
      safeFileNames: true
    }
  })
);
server.use(
  bodyParser({
    limit: "50mb"
  })
);

server.use("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "x-request-id,Content-Type,Accept");
  return next();
});

var tokens = {
  "89d40b8b3dbjhe443b65b14": true
};

// server.use("/v1/*", function(req, res, next) {
//   if (req.method == "OPTIONS") {
//     return next();
//   }
//   if (req.headers && req.headers["x-request-id"] && tokens[req.headers["x-request-id"]]) {
//     return next();
//   } else {
//     res.send({
//       erro: "token"
//     });
//   }
// });

new Login(server);
new Member(server);

new Router(server);

server.listen(7000);
