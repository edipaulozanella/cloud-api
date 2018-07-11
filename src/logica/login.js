// by 1app
import Banco from "../infra/pg";
import * as Util from "../infra/util";
import request from "request";
import * as Sql from "../infra/util_sql";
import * as Member from "./member";

console.log(Util.makeToken({ id: 62 }));

function atualizarDados(callback) {
  Banco.select("update treino set id_aluno = aluno.transferencia from aluno where aluno.id = treino.id_aluno and transferencia is not null and treino.id_aluno != transferencia", () => {
    Banco.select("update anotacao set id_aluno = aluno.transferencia from aluno where aluno.id = anotacao.id_aluno and transferencia is not null and anotacao.id_aluno != transferencia", () => {
      Banco.select("update cobranca set id_aluno = aluno.transferencia from aluno where aluno.id = cobranca.id_aluno and transferencia is not null and cobranca.id_aluno != transferencia", () => {
        callback();
      });
    });
  });
}

export function criarUser(data, callback) {
  data.ativo = true;
  var sql = Sql.insert("aluno", ["nome", "email", "foto", "foto_large", "genero", "email_verificado", "id_google", "ativo", "id_facebook"], data);
  Banco.gravar(sql, (result, error) => {
    setTimeout(() => {
      result.grupos = [];
      result.equipes = [];
      callback(result, error);
    }, 1000);
    // AlunoImportar.povoar(result.id, () => {});
  });
}

export function atualizarUser(data, callback) {
  data.ativo = true;
  var sql = Sql.update("aluno", ["nome", "email", "foto", "foto_large", "genero", "email_verificado", "ativo", "id_facebook"], data, " where id = " + data.id);
  Banco.gravar(sql, (result, error) => {
    // AlunoImportar.povoar(result.id);
    Member.buscar(data.id, (user, error) => {
      // console.log(user)
      callback(user, error);
    });
  });
}
export function salvar(item, callback) {
  if (item.id) {
    atualizarUser(item, (data, error) => {
      if (callback) callback(data, error);
    });
  } else {
    criarUser(item, (data, error) => {
      if (callback) callback(data, error);
    });
  }
}

export function loginFacebook(token, callback) {
  var url = "https://graph.facebook.com/v2.5/me?fields=id,name,email,gender&access_token=" + token;
  //   console.log(url);
  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var obj = JSON.parse(body);
      //   var sqlUser = "select * from aluno where id_facebook='" + obj.id + "' limit 1";
      //   if (obj.email) {
      var sqlUser = "select * from member where email='" + obj.email + "' limit 1";
      //   }
      Banco.first(sqlUser, item => {
        if (!item) {
          item = { id_facebook: obj.id + "" };
        }
        item.foto = "https://graph.facebook.com/" + obj.id + "/picture?type=normal&time=" + new Date().getTime();
        item.foto_large = "https://graph.facebook.com/" + obj.id + "/picture?type=large&time=" + new Date().getTime();
        if (!item.nome) item.nome = obj.name;
        if (!item.email) item.email = obj.email;
        item.genero = obj.gender;
        item.email_verificado = obj.email ? true : false;
        ///testar emails
        if (!obj.email) return callback(null, { msg: "Email não identificado" });
        //salvar
        salvar(item, (user, error) => {
          user.token = Util.makeToken({ id: user.id });
          if (callback) callback(user, null);
        });
      });
    } else {
      if (callback) callback(null, { msg: "token invalido", data: error, body: body });
    }
  });
}

export function loginGoogle(email, photo, nome, id_google, callback) {
  Banco.first("select * from member where  email='" + email.trim() + "'     limit 1 ", item => {
    if (!item) {
      item = {};
    }
    item.id_google = id_google;
    item.foto = photo;
    item.foto_large = photo;
    if (!item.nome) item.nome = nome;
    if (!item.email) item.email = email;
    item.email_verificado = email ? true : false;

    salvar(item, (user, error) => {
      user.token = Util.makeToken({ id: user.id });
      if (callback) callback(user, null);
    });
  });
}

export function loginEmail(email, password, callback) {
  Banco.first("select * from platform.member where  email='" + email.trim() + "'    limit 1 ", user => {
    user.token = Util.makeToken({ id: user.id });
    if (callback) callback(user, null);
  });
}
