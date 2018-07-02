"use strict";
import BancoMultiplo from "./banco_multiplo";
var moment = require("moment");
var client = null;
var debug = false;

exports.setDatabase = function(host, nome, PUser, Ppassword) {
  BancoMultiplo.setDatabase(host, nome, PUser, Ppassword);
  // NovoCliente();
};
exports.setDebug = function(status) {
  BancoMultiplo.setDebug(status);
  debug = status;
};
exports.setPort = function(pt) {
  BancoMultiplo.setPort(pt);
  port = pt;
};

exports.desativarItemUso = function(item) {
  BancoMultiplo.desativarItemUso(item);
};

exports.getDB = function(callback) {
  BancoMultiplo.getClientNew(clientNew => {
    callback(clientNew);
  });
};

function getPgCliente(callback) {
  BancoMultiplo.getClientNew(clientNew => {
    callback(clientNew);
  });
}

exports.first = function(sql, retorno) {
  BancoMultiplo.first(sql, retorno);
};
exports.select = function(sql, retorno) {
  BancoMultiplo.select(sql, retorno);
};

exports.exec = function(sql, retorno) {
  BancoMultiplo.select(sql, retorno);
};

exports.gravar = function gravar(sql, retorno) {
  BancoMultiplo.query(sql, function(err, result) {
    if (err) {
      if (debug) console.log(err);
      if (retorno) retorno(result, err);
    } else {
      retorno(result.rows[0]);
    }
  });
};
