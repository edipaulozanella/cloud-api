// by 1app
var api_key = "key-04827bdf3e84b3ef9326296a6fcb1ad9";
var domain = "1app.com.br";
var mailgun = require("mailgun-js")({ apiKey: api_key, domain: domain });

export function enviarEmailComCodigo(codigo, email, nome) {
  var send = {
    subject: "Código de ativação do app ",
    to: email,
    from: "Suporte 1App <suporte@1app.com.br>",
    text: "Olá, " + (nome ? nome : "usuário") + "\n\nSeu código para logar no app: " + codigo + "\n\n Att: equipe www.1app.com.br "
  };
  // console.log(send);
  mailgun.messages().send(send, function(error, body) {
    //  Enviou
  });
}
