import express from "express";
import * as Init from "./logica/init";
import Router from "./router/index.pages.js";
import Banco from "./infra/mongo";

Banco.setDatabase("database");


var server = express();

Init.start(server);
new Router(server)

 

server.listen(7000);
