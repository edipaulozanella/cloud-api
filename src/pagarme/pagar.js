var PhoneNumber = require("awesome-phonenumber");
import pagarme from "pagarme";
import md5 from "md5";
import { CPF, CNPJ } from "cpf_cnpj";
import Util from "../infra/util";
import moment from "moment";

export function pagarNoCartao(api_key, cartao, recebedores, total, callback) {
  if (total < 10) return callback(null, { msg: "Valor mínimo para pagamente online é R$ 10,00" });

  var send = {
    payment_method: "credit_card",
    card_id: cartao.card_id,
    amount: parseAmount(total),
    customer: montarCustumer(cartao),
    billing: montarBilling(cartao),
    items: montarItem(cartao, total)
  };
  if (recebedores && recebedores.length > 0) {
    send.split_rules = split(recebedores, total);
  }
  //   console.log(send);
  executarPagamento(api_key, send, (transactions, error) => {
    // console.log(transactions, error);
    if (transactions && transactions.status == "paid") {
      //processing, authorized
      //   console.log(transactions);
      callback({
        recebedores: listRecebedores(recebedores),
        valor: transactions.amount,
        status: transactions.status,
        codigo: cartao.tags,
        bandeira: cartao.brand,
        id_transacao: transactions.id,
        tipo: "credit_card",
        acquirer_id: transactions.acquirer_id,
        antifraud_metadata: transactions.antifraud_metadata
      });
    } else {
      callback(null, error);
    }
  });
}
export function listRecebedores(lista) {
  if (!lista) return "";
  var recebedores = "";
  for (let i = 0; i < lista.length; i++) {
    let item = lista[i];
    if (i > 0) {
      recebedores += ",";
    }
    recebedores += item.id_recebedor;
  }
  return recebedores;
}

export function pagarNoBoleto(api_key, user, recebedores, total, callback) {
  if (total < 10) return callback(null, { msg: "Valor mínimo para pagamente online é R$ 10,00" });

  if (!CPF.isValid(user.doc) && !CNPJ.isValid(user.doc)) {
    return callback(null, { msg: "documento inválido" });
  }
  var vencimento = moment().add(3, "day");
  var send = {
    boleto_expiration_date: vencimento.format("YYYY-MM-DD"),
    payment_method: "boleto",
    amount: parseAmount(total),
    customer: montarCustumer(user)
  };
  if (recebedores && recebedores.length > 0) {
    send.split_rules = split(recebedores, total);
  }
  executarPagamento(api_key, send, (transactions, error) => {
    // console.log(transactions, error);
    if (transactions && transactions.status == "waiting_payment") {
      callback({
        recebedores: listRecebedores(recebedores),
        valor: transactions.amount,
        id_transacao: transactions.id,
        tipo: "boleto",
        bandeira: "boleto",
        vencimento: transactions.boleto_expiration_date,
        status: transactions.status,
        acquirer_id: transactions.acquirer_id,
        codigo: transactions.boleto_barcode,
        boleto_expiration_date: transactions.boleto_expiration_date,
        boleto_url: transactions.boleto_url
      });
    } else {
      callback(null, error);
    }
  });
}

export function montarCustumer(cartao) {
  var telefone = cartao.telefone;
  var prefixo = "";
  var numeroTelefone = "";
  if (telefone) {
    var pn = new PhoneNumber(cartao.telefone, "BR");
    telefone = pn.getNumber("e164");
    var nacional = pn.getNumber("national");
    prefixo = Util.cleanNumber(nacional.split(" ")[0]);
    numeroTelefone = Util.cleanNumber(nacional.split(" ")[1]).replace("-", "");
  }
  cartao.is_cpf = CPF.isValid(cartao.doc);
  var document_number = CPF.isValid(cartao.doc) ? CPF.strip(cartao.doc) : CNPJ.strip(cartao.doc);
  var data = {
    name: cartao.holder_name,
    external_id: "id_" + cartao.id,
    country: "br",
    type: cartao.is_cpf ? "individual" : "corporation",
    // document_type: cartao.is_cpf ? "cpf" : "cnpj",
    // document_number: document_number,
    documents: [
      {
        type: cartao.is_cpf ? "cpf" : "cnpj",
        number: document_number
      }
    ],
    email: cartao.email,
    // phone: { number: numeroTelefone, ddd: prefixo },
    phone_numbers: telefone ? [telefone] : []
    // address: {
    //   street_number: cartao.numero,
    //   zipcode: cartao.cep,
    //   neighborhood: cartao.bairro,
    //   street: cartao.rua
    // }
  };
  return data;
}
export function montarItem(data, total) {
  return [
    {
      id: "id_" + data.id,
      title: "Mensalidade",
      unit_price: parseAmount(total),
      quantity: 1,
      tangible: false
    }
  ];
}
export function montarBilling(cartao) {
  //   console.log(cartao);
  var data = {
    name: cartao.holder_name,
    address: {
      state: cartao.estado,
      city: cartao.cidade,
      country: "br",
      street_number: cartao.numero,
      zipcode: Util.cleanNumber(cartao.cep)
        .replace("-", "")
        .trim(),
      neighborhood: cartao.bairro,
      street: cartao.rua
    }
  };
  //   console.log(data);
  return data;
}
export function executarPagamento(api_key, send, callback) {
  pagarme.client
    .connect({ api_key: api_key })
    .then(client => client.transactions.create(send))
    .then(transactions => {
      try {
        callback(transactions);
      } catch (e) {
        console.log(e);
      }
    })
    .catch(error => {
      console.log(JSON.stringify(error));
      var msgErro = "Seu pagamento não foi processado, verifiqueu os dados informados...";
      if (error && error.response && error.response.errors) {
        for (let i = 0; i < error.response.errors.length; i++) {
          let item = error.response.errors[i];
          msgErro += " " + item.message;
          //   console.log(item.parameter_name, item.message);
        }
      }
      callback(null, { msg: msgErro });
    });
}
export function split(recebedores, total) {
  var split_rules = [];
  var amount = parseAmount(total);
  var soma = 0;
  for (let i = 0; i < recebedores.length; i++) {
    let recebedor = recebedores[i];
    var valor = parseInt(recebedor.porcentagem * amount);
    soma += valor;
    split_rules.push({
      recipient_id: recebedor.id_recebedor,
      charge_processing_fee: true,
      //   charge_remainder: true,
      liable: true,
      amount: valor
    });
  }
  ///verifica o total e corrige
  if (soma != amount) {
    split_rules[0].amount += amount - soma;
  }
  return split_rules;
}

export function parseAmount(value) {
  var centavos = parseFloat(value) * 100;
  return parseInt(centavos);
}
