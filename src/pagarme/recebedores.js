// by 1app
import pagarme from "pagarme";
import md5 from "md5";
import { CPF, CNPJ } from "cpf_cnpj";

export function parseAmount(value) {
  var centavos = parseFloat(value) * 100;
  return parseInt(centavos);
}

export function addRecebedores(api_key, conta, callback) {
  //   console.log(conta);
  var send = montarRecebedor(conta);
  //   console.log(send);
  executarEnvio(api_key, send, (registro, error) => {
    // console.log(registro, error);
    callback(registro, error);
  });
}

export function cancelarTransferencia(api_key, id_transferencia, callback) {
  pagarme.client
    .connect({ api_key: api_key })
    .then(client =>
      client.transfers.cancel({
        id: id_transferencia
      })
    )
    .then(balance => {
      if (callback) callback(balance);
    })
    .catch(error => {
      var msgErro = "Erro de parametros... ";
      if (error && error.response && error.response.errors) {
        for (let i = 0; i < error.response.errors.length; i++) {
          let item = error.response.errors[i];
          msgErro += " " + item.message;
        }
      }
      if (callback) callback(null, { msg: msgErro });
    });
}

export function listarTransferencias(api_key, recipientId, callback) {
  pagarme.client
    .connect({ api_key: api_key })
    .then(client =>
      client.transfers.all({
        count: 3,
        page: 1,
        recipient_id: recipientId
      })
    )
    .then(balance => {
      if (callback) callback(balance);
    })
    .catch(error => {
      var msgErro = "Erro de parametros... ";
      if (error && error.response && error.response.errors) {
        for (let i = 0; i < error.response.errors.length; i++) {
          let item = error.response.errors[i];
          msgErro += " " + item.message;
        }
      }
      if (callback) callback(null, { msg: msgErro });
    });
}

export function solicitarTransferencia(api_key, recipientId, total, callback) {
  //   console.log(recipientId, total);
  total = total - 4;
  //   total = 10;
  pagarme.client
    .connect({ api_key: api_key })
    .then(client =>
      client.transfers.create({
        amount: parseAmount(total),
        recipient_id: recipientId
      })
    )
    .then(balance => {
      console.log(balance);
      if (callback) callback(balance);
    })
    .catch(error => {
      console.log(JSON.stringify(error));
      var msgErro = "Transferência não processada... ";
      if (error && error.response && error.response.errors) {
        for (let i = 0; i < error.response.errors.length; i++) {
          let item = error.response.errors[i];
          msgErro += " " + item.message;
        }
      }
      if (callback) callback(null, { msg: msgErro });
    });
}
export function montarRecebedor(conta) {
  return {
    transfer_interval: "monthly",
    transfer_day: "2",
    transfer_enabled: "false",
    automatic_anticipation_enabled: "false",
    anticipatable_volume_percentage: "0",
    bank_account: {
      bank_code: conta.codigo_banco + "",
      agencia: conta.agencia + "",
      conta: conta.conta + "",
      conta_dv: conta.digito_conta ? conta.digito_conta + "" : null,
      agencia_dv: conta.digito_agencia ? conta.digito_agencia + "" : null,
      document_number: conta.doc + "",
      legal_name: conta.nome,
      type: conta.tipo //conta_corrente : conta_poupanca
    }
  };
}
export function executarEnvio(api_key, send, callback) {
  pagarme.client
    .connect({ api_key: api_key })
    .then(client => client.recipients.create(send))
    .then(recipients => {
      callback(recipients);
    })
    .catch(error => {
      //   console.log(JSON.stringify(error));
      var msgErro = "Dados não aceitos. ";
      if (error && error.response && error.response.errors) {
        for (let i = 0; i < error.response.errors.length; i++) {
          let item = error.response.errors[i];
          msgErro += " " + item.parameter_name;
          msgErro += " : " + item.message;
        }
      }
      callback(null, { msg: msgErro });
    });
}

export function saldoRecebedor(api_key, recipientId, callback) {
  pagarme.client
    .connect({ api_key: api_key })
    .then(client => client.balance.find({ recipientId: recipientId }))
    .then(balance => {
      //   console.log(balance, recipientId);
      if (callback) callback(balance);
    })
    .catch(error => {
      var msgErro = "Dados não encontrados ";
      if (error && error.response && error.response.errors) {
        for (let i = 0; i < error.response.errors.length; i++) {
          let item = error.response.errors[i];
          msgErro += " " + item.message;
        }
      }
      if (callback) callback(null, { msg: msgErro });
    });
}
