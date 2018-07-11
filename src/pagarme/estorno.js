var PhoneNumber = require("awesome-phonenumber");
import pagarme from "pagarme";
import md5 from "md5";
import { CPF, CNPJ } from "cpf_cnpj";
import Util from "../infra/util";

export function solicitarEstorno(api_key, id_transacao, callback) {
  pagarme.client
    .connect({ api_key: api_key })
    .then(client =>
      client.transactions.refund({
        id: id_transacao
      })
    )
    .then(transactions => {
      console.log(transactions);
      callback(transactions);
    })
    .catch(error => {
         console.log(JSON.stringify(error),id_transacao);
      var msgErro = "Seu pagamento não pode ser estornado...";
      if (error && error.response && error.response.errors) {
        for (let i = 0; i < error.response.errors.length; i++) {
          let item = error.response.errors[i];
          msgErro += " \n" + item.message;
          //   console.log(item.parameter_name, item.message);
        }
      }
      callback(null, { msg: msgErro });
    });
}
