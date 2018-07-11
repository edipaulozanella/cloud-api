import pagarme from "pagarme";
var moment = require("moment");
// moment.locale('pt-br');
var randomize = require("randomatic");
var random = require("random-js")();
import * as makeCartao from "./makeCartao";
import * as apiPagar from "./pagar";
import * as recebedor from "./recebedores";
import * as estorno from "./estorno";
var request = require("request");

//produção
var api_key = "";
var encryption_key = "";

//teste
var api_key = "";
var encryption_key = "";

export function buscarCep(cep, callback) {
  var options = {
    method: "GET",
    url: "https://api.pagar.me/1/zipcodes/" + cep
  };
  request(options, (error, response, body) => {
    callback(body, error);
  });
}

export function extornarCobranca(id_trasacao, callback) {
  estorno.solicitarEstorno(api_key, id_trasacao, (trasacao, error) => {
    if (callback) callback(trasacao, error);
  });
}

export function registrarCartao(data, callback) {
  makeCartao.criarCartao(data, encryption_key, api_key, (card, error) => {
    // console.log(card, error);
    if (callback) callback(card, error);
  });
}

export function pagarComCartao(cartao, total, callback) {
  apiPagar.pagarNoCartao(api_key, cartao, null, total, (data, error) => {
    if (callback) callback(data, error);
  });
}

export function pagarNoCartaoComRecebedores(cartao, recebedores, total, callback) {
  apiPagar.pagarNoCartao(api_key, cartao, recebedores, total, (data, error) => {
    if (callback) callback(data, error);
  });
}

export function pagarComBoleto(user, total, callback) {
  apiPagar.pagarNoBoleto(api_key, user, null, total, (data, error) => {
    if (callback) callback(data, error);
  });
}

export function pagarNoBoletoComRecebedores(user, recebedores, total, callback) {
  apiPagar.pagarNoBoleto(api_key, user, recebedores, total, (data, error) => {
    if (callback) callback(data, error);
  });
}

export function saldoRecebedor(recipientId, callback) {
  recebedor.saldoRecebedor(api_key, recipientId, (data, error) => {
    if (callback) callback(data, error);
  });
}
export function addRecebedores(conta, callback) {
  try {
    recebedor.addRecebedores(api_key, conta, (data, error) => {
      if (callback) callback(data, error);
    });
  } catch (e) {
    console.log(e);
  }
}
export function listarTransferencias(recipientId, callback) {
  recebedor.listarTransferencias(api_key, recipientId, (data, error) => {
    if (callback) callback(data, error);
  });
}

export function solicitarTransferencia(recipientId, total, callback) {
  recebedor.solicitarTransferencia(api_key, recipientId, total, (data, error) => {
    if (callback) callback(data, error);
  });
}

export function cancelarTransferencia( id_transferencia, callback) {
  recebedor.cancelarTransferencia(api_key, id_transferencia, (data, error) => {
    if (callback) callback(data, error);
  });
}
