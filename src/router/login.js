import { FB, FacebookApiException } from "fb-node-sdk";
var appId = "764521450362145";
var appSecret = "a5ddeea72a47cdca4552bf5629ea4fb0";
FB.extend({ appId: appId, appSecret: appSecret });


var request = require("request");
import * as Login from "../logica/login";

export default class Router {
  constructor(server) {
    //documentaçao
    //rota
    //validacao
    server.get("/v1/login/facebook", (req, res) => {
      if (!req.query.token) {
        res.status(500).send({ msg: "sem token" });
        return;
      }
      Login.loginFacebook(req.query.token, (data, error) => {
        if (error) {
          res.status(500).send(error);
        } else {
          res.send(data);
        }
      });
    });

    server.get("/v1/login/email", (req, res) => {
      console.log(req.query);
      if (!req.query.email) {
        res.status(500).send({ msg: "sem token" });
        return;
      }
      Login.loginEmail(req.query.email, req.query.password, (data, error) => {
        if (error) {
          res.status(500).send(error);
        } else {
          res.send(data);
        }
      });
    });

    server.get("/v1/login/google", (req, res) => {
      var user = req.query;
      var nome = user.nome;
      var email = user.email;
      var foto = user.foto;
      var idGoogle = user.idGoogle;
      Login.loginGoogle(email, foto, nome, idGoogle, (data, error) => {
        if (error) {
          res.status(400).send(error);
        } else {
          res.send(data);
        }
      });
    });

    server.put("/v1/instalacao", (req, res) => {
      //console.log(req.body);
      var token = req.body.token;
      var id_user = req.body.id_user;
      var plataforma = req.body.plataforma;
        console.log(req.body)
      // if (!token) return res.status(400).send({ msg: "token_divece inativo" });
      if (token) {

        Login.updateInstalacao(token, id_user, plataforma, (data, error) => {
          if (error) {
            res.status(400).send(error);
          } else {
            res.send(data);
          }
        });
      }else {
        Login.updateUserDevice(id_user,(user,error)=>{
          if (error) {
            res.status(400).send(error);
          } else {
            res.send(user);
          }
        })
      }
    });

    server.get("/login/fb_sdk/:id_md5", (req, res) => {
      var id_md5 = req.params.id_md5;
      var url = FB.getLoginUrl({
        client_id: appId,
        scope: "email",
        redirect_uri: "https://api.meu.training/login/fb_code?id=" + id_md5
      });
      res.redirect(url);
    });

    server.get("/login/fb_code", (req, res) => {
      var query = req.query;
      var id_md5 = query.id;
      var code = query.code;
      FB.api(
        "oauth/access_token",
        {
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: "https://api.meu.training/login/fb_code",
          code: code
        },
        res => {
          console.log(res);
          if (!res || res.error) {
            //console.log(!res ? "error occurred" : res.error);
            res.redirect("https://meu.training/erro_login");
          } else {
            LoginIntegrar.atualizarUser(id_md5, res.access_token, () => {
              // LoginIntegrar.atualizarUser(id_md5, teste, () => {
              res.redirect("https://meu.training/app");
            });
          }
        }
      );
    });




  }
}
