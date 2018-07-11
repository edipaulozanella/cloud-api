// by 1app
import Banco from "../infra/pg";
import * as Util from "../infra/util";
import request from "request";
import * as Sql from "../infra/util_sql";

export function criar(data, user_id, callback) {
  var sql = Sql.insert("platform.member", ["name", "password", "email"], data);
  console.log(sql) 
  Banco.gravar(sql, (data, error) => {
    if (callback) callback(data, error);
  });
}

export function alterar(data, id, callback) {
  data.id = id;
  var sql = Sql.update("platform.member", ["name","password", "email"], data, " where id = " + id);
  Banco.gravar(sql, (data, error) => {
    if (callback) callback(data, error);
  });
}

// export function buscar(id_aluno, callback) {
//   var sql = Sql.getSql("user");
//   sql = Sql.select(sql, [id_aluno]);

//   Banco.first(sql, (user, error) => {
//     //   console.log(user,error)
//     if (!user || !user.id) {
//       if (callback) callback(null, { msg: "não encontrado" });
//     } else {
//       user.token = Util.makeToken({ id: user.id });
//       if (callback) callback(user, error);
//     }
//   });
// }

export function listar(callback) {
  Banco.select("select * from platform.member  order by id desc ", (user, error) => {
    if (callback) callback(user, error);
  });
}
