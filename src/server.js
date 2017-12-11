import express from "express";
import restful from "express-restful-es6";
import * as Init from "./logica/init";
import Router from "./router/index.pages.js";
import Banco from "./infra/mongo";

Banco.setDatabase("bk");


var server = express();
restful.configure(server, {
  dirname: __dirname + "/api"
});

Init.start();
new Router(server)

 

server.listen(7000);
