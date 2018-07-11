// by 1app
import pagarme from "pagarme";
import md5 from "md5";

export function criarCartao(card, encryption_key, api_key, callback) {
  makeTokenApi(card, encryption_key, (card_hash, error) => {
    if (error) {
      if (callback) callback(null, error);
    } else {
      makeCard(card, card_hash, api_key, (card, error) => {
        if (callback) callback(card, error);
      });
    }
  });
}
export function makeTokenApi(data, encryption_key, callback) {
  // "card_expiration_date": "1122",
  var card = {
    card_number: data.card_number + "",
    card_holder_name: data.card_holder_name,
    card_expiration_date: data.card_expiration_date,
    card_cvv: data.card_cvv + ""
  };
  //   console.log(card);
  pagarme.client
    .connect({ encryption_key: encryption_key })
    .then(client => client.security.encrypt(card))
    .then(card_hash => {
      if (callback) callback(card_hash);
    })
    .catch(error => {
      var msgErro = "Seu cartão não foi aceito, verifique os dados informados e tente novamente. ";
      if (error && error.response && error.response.errors) {
        for (let i = 0; i < error.response.errors.length; i++) {
          let item = error.response.errors[i];
          msgErro += " "+ item.message;
        }
      }
      callback(null, { msg: msgErro });
    });
}

export function makeCard(data, card_hash, api_key, callback) {
  var card = {
    card_hash: card_hash
  };
  pagarme.client
    .connect({ api_key: api_key })
    .then(client => client.cards.create(card))
    .then(cards => {
      var result = {};
      result.card_cvv = md5(data.card_cvv);
      result.tags = "XXXX-XXXX-XXXX-" + cards.last_digits;
      result.card_id = cards.id;
      result.holder_name = cards.holder_name;
      result.last_digits = cards.last_digits;
      result.brand = cards.brand;
      if (cards.valid) {
        callback(result, null);
      } else {
        callback(null, { error: "Seu cartão não foi aceito, verifique os dados informados e tente novamente" });
      }
    })
    .catch(error => {
      //   console.log(JSON.stringify(error));
      var msgErro = "Seu cartão não foi aceito, verifique os dados informados e tente novamente. ";
      if (error && error.response && error.response.errors) {
        for (let i = 0; i < error.response.errors.length; i++) {
          let item = error.response.errors[i];
          msgErro += " "+ item.message;
        }
      }
      callback(null, { msg: msgErro });
    });
}
