"use strict";

var pg = require("pg");
var client = null;
var escape = require("pg-escape");

var database = "projeto";
var debug = false;
var port = 5432;
var password = "";
var user = "";
exports.setDatabase = function(nome, PUser, Ppassword) {
  password = Ppassword;
  user = PUser;
  database = nome;
  database = database ? database.toLowerCase() : "data";
  NovoCliente();
};
exports.setDebug = function(status) {
  debug = status;
};
exports.setPort = function(pt) {
  port = pt;
};

function NovoCliente() {
  var cf = {
    user: user,
    password: password,
    database: database,
    port: port,
    host: "localhost"
  };
  console.log(cf);
  client = new pg.Client(cf);
  client.connect();
  try {
    exe("SET SESSION timezone TO 'Brazil/East'", function() {});
  } catch (e) {}
  client.on("error", function(e) {
    console.log(e, "error client");
    setTimeout(function() {
      NovoCliente();
    }, 1000);
  });
}

exports.getDB = function() {
  if (!client) {
    NovoCliente();
  }
  return client;
};

function getPgCliente() {
  if (!client) {
    NovoCliente();
  }
  return client;
}

exports.getLista = function(sql, retorno) {
  var client = getPgCliente();
  console.log("sql", sql);
  client.query(sql, function(err, result) {
    //        client.end();
    if (err) {
      console.error(err);
    }
    if (result && result.rows) {
      retorno(result.rows);
    } else {
      console.log({
        error: "sem rows no getLista"
      });
      retorno([]);
    }
  });
};
exports.first = function(sql, retorno) {
  if (debug) {
    console.log(sql);
  }
  var client = getPgCliente();
  client.query(sql, function(err, result) {
    //        client.end();

    if (err) {
      console.error(err, sql);
    }
    if (result && result.rows) {
      if (retorno) {
        retorno(result.rows[0]);
      }
    } else {
      console.log({
        error: "sem rows no select"
      });
      if (retorno) {
        retorno(null);
      }
    }
  });
};
exports.select = function(sql, retorno) {
  if (debug) {
    console.log(sql);
  }
  var client = getPgCliente();
  client.query(sql, function(err, result) {
    //        client.end();

    if (err) {
      console.error(err, sql);
    }
    if (result && result.rows) {
      if (retorno) {
        retorno(result.rows);
      }
    } else {
      console.log({
        error: "sem rows no select"
      });
      if (retorno) {
        retorno([]);
      }
    }
  });
};

function makeWhereSql(where) {
  var lista = Object.keys(where);
  var whereSql = "";

  for (var i = 0; i < lista.length; i++) {
    var nome = lista[i];
    var value = where[nome];
    if (i > 0) {
      whereSql += " and ";
    }
    var v = " '" + value + "' ";
    if (value == "null" || value == null) {
      v = " IS NULL ";
      whereSql += ' "' + nome + '"  ' + v;
      continue;
    }
    // console.log(nome,value);
    if (value.$gt) {
      whereSql += ' "' + nome + "\" > '" + value.$gt + "' ";
    } else if (value.$gte) {
      whereSql += ' "' + nome + "\" >= '" + value.$gte + "' ";
    } else if (value.$eq) {
      whereSql += ' "' + nome + "\" = '" + value.$eq + "' ";
    } else if (value.$lt) {
      whereSql += ' "' + nome + "\" < '" + value.$lt + "' ";
    } else if (value.$lte) {
      whereSql += ' "' + nome + "\" <= '" + value.$lte + "' ";
    } else if (value.$in) {
      whereSql +=
        ' "' +
        nome +
        '" IN ' +
        JSON.stringify(value.$in)
          .replace("{", "[")
          .replace("}", "]");
    } else if (value.$ne) {
      if (value.$ne == "null" || value.$ne == null) {
        whereSql += ' "' + nome + '"  ' + " IS NOT NULL ";
      } else {
        whereSql += ' "' + nome + "\" <> '" + value.$ne + "' ";
      }
    } else if (value.$nin) {
      whereSql +=
        ' "' +
        nome +
        '" NO IN ' +
        JSON.stringify(value.$nin)
          .replace("{", "[")
          .replace("}", "]");
    } else if (value.$exists || value.$exists == false) {
      whereSql += ' "' + nome + '" IS ' + (value.$exists == false ? "" : " NOT ") + " NULL ";
      // console.log(nome,value,value.$exists,whereSql);
    } else if (value.$regex) {
      whereSql += ' "' + nome + '"' + " iLIKE '%" + value.$regex + "%' ";
    } else {
      whereSql += ' "' + nome + '" = ' + v;
    }
  }
  return whereSql;
}

function makeOrderSql(where) {
  var lista = Object.keys(where);
  var sql = "";

  for (var i = 0; i < lista.length; i++) {
    var nome = lista[i];
    var value = where[nome];
    if (i > 0) {
      sql += " , ";
    }
    sql += '"' + nome + '" ' + (value == 1 ? " ASC " : " DESC ");
  }
  return sql ? " order by " + sql : "";
}

function makeSql(where, order, limit) {
  where = where ? where : {};
  order = order ? order : {};
  limit = limit ? limit : 0;
  try {
    // var lista = Object.keys(where);
    var whereSql = "where";
    // console.log(whereSql);
    // console.log(where);
    if (where.$or && where.$or.length > 0) {
      for (var i = 0; i < where.$or.length; i++) {
        var pos = where.$or[i];
        var sql = makeWhereSql(pos);
        // console.log(sql);
        if (sql) {
          if (whereSql != "where") {
            whereSql += " or ";
          }
          whereSql += " ( " + sql + " ) ";
        }
      }
    } else if (where.$and && where.$and.length > 0) {
      for (var i = 0; i < where.$and.length; i++) {
        var pos = where.$and[i];
        var sql = makeWhereSql(pos);
        // console.log(sql);
        if (sql) {
          if (whereSql != "where") {
            whereSql += " and ";
          }
          whereSql += " ( " + sql + " ) ";
        }
      }
    } else {
      var sql = makeWhereSql(where);
      // console.log(sql,"dois");
      if (sql) {
        whereSql += " " + sql + " ";
      }
    }
    whereSql = whereSql != "where" ? whereSql : "";
    // console.log(whereSql);
    return whereSql + " " + makeOrderSql(order) + " " + (limit > 0 ? " limit " + limit : "");
  } catch (e) {
    console.log(e);
    return "";
  }
}
exports.makeSql = makeSql;
exports.makeOrderSql = makeOrderSql;

exports.getData = function(entidade, where, retorno) {
  var client = getPgCliente();
  // console.log(where);
  var sql = "select * from " + entidade + " " + makeSql(where) + " limit 1 ";
  if (debug) {
    console.log(sql);
  }
  client.query(sql, function(err, result) {
    //        client.end();
    if (err) {
      console.error(err);
    }
    if (result && result.rows && result.rows[0]) {
      retorno(result.rows[0]);
    } else {
      retorno(null);
    }
  });
};
exports.getListaWhere = function(entidade, where, retorno) {
  var client = getPgCliente();
  // console.log(where);
  var sql = "select * from " + entidade + " " + makeSql(where) + "   ";
  if (debug) {
    console.log(sql);
  }
  client.query(sql, function(err, result) {
    //        client.end();
    if (err) {
      console.error(err);
    }
    if (result && result.rows) {
      retorno(result.rows);
    } else {
      retorno([]);
    }
  });
};
exports.getDataFromSql = function(sql, retorno) {
  var client = getPgCliente();
  client.query(sql, function(err, result) {
    //        client.end();
    if (err) {
      console.error(err);
    }
    if (result && result.rows && result.rows[0]) {
      retorno(result.rows[0]);
    } else {
      retorno(null);
    }
  });
};

function MontarInsert(obj, colunas, tabela) {
  function replaceAll(string, str, key) {
    try {
      if (!string) {
        return "";
      }
      if (!str) {
        return string;
      }
      if (!key) {
        key = "";
      }
      return string.replace(new RegExp(str.replace(/[-\/\\^$*+?.()|[\]{}]/g, /[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g"), key);
    } catch (e) {
      return string;
    }
  }

  function corrigirString(string) {
    var ori = new String(string);
    string = "";
    for (var a = 0; a < ori.length; a++) {
      var cString = ori.substring(a, a + 1);
      if (cString === "\\") {
        cString = "\\\\";
      }
      string += cString;
    }
    string = replaceAll(string, "'", "\\'");
    return string;
  }

  if (!obj.objectId || !obj.status) {
    obj.status = 1;
  }

  var sql_insert = "insert into " + tabela + "(  ";
  var sql_insert_value = " values (  ";
  var sql_update = " update " + tabela + " set ";

  var lista = Object.keys(colunas);
  var pos_virgula = 0;
  for (var i = 0; i < lista.length; i++) {
    var nome = lista[i];
    var valorObj = obj[nome] + "";
    if (valorObj == "undefined" || nome == "_id" || nome == "objectId") {
      continue;
    }
    var type = getTypeValue(nome);
    if (type == "int" || type == "double" || type == "timestamp" || type == "int") {
      if (valorObj == "") {
        valorObj = "null";
      }
    }
    if (asPrefixado(nome) == "sql") {
      continue;
    }

    if (pos_virgula > 0) {
      sql_insert += ",";
      sql_insert_value += ",";
      sql_update += ",";
    }
    pos_virgula++;

    sql_insert += ' "' + nome + '" ';
    sql_update += ' "' + nome + '" = ';
    // console.log(colunas[nome],valorObj,nome);
    // if (obj[nome] || obj[nome] === 0 || obj[nome] === false) {
    switch (colunas[nome]) {
      case "updatedAt":
        // if (vDia.toISOString) {
        //   valorObj = vDia.toISOString();
        // } else if (vDia instanceof Date || vDia.length > 25) {
        //   valorObj = new Date(vDia).toISOString();
        // }
        // if (valorObj) {
        //
        //   // sql_insert_value += "'" + valorObj + "'";
        // } else {
          // sql_insert_value += 'default';
          sql_insert_value += "'" + new Date().toISOString() + "'";
        // }
        sql_update += "'" + new Date().toISOString() + "'";
        break;

      case "createdAt":
        var vDia = obj[nome];
        // valorObj = new Date(vDia).toISOString();
        if (vDia.toISOString) {
          valorObj = vDia.toISOString();
        } else if (vDia instanceof Date || vDia.length > 25) {
          valorObj = new Date(vDia).toISOString();
        }
        // console.log(valorObj,vDia);
        if (valorObj) {
          sql_insert_value += "'" + valorObj + "'";
        } else {
          sql_insert_value += "'" + new Date().toISOString() + "'";
          // sql_insert_value += 'default';
        }
        sql_update += "'" + valorObj + "'";
        break;

      case "number":
        var value_s = valorObj;

        if (value_s == "null") {
          sql_insert_value += " null ";
          sql_update += " null ";
        } else {
          sql_insert_value += "'" + valorObj + "'";
          sql_update += "'" + valorObj + "'";
        }

        break;

      case "date":
        var vDia = obj[nome];

        try {
          if (vDia && vDia.toISOString) {
            valorObj = vDia.toISOString();
          } else if (vDia && (vDia instanceof Date || vDia.length > 25)) {
            valorObj = new Date(vDia).toISOString();
          }
        } catch (e) {
          console.log(e);
          console.log(vDia);
          console.log(nome);
          console.log("\n\n\n\n\n");
          // valorObj="null";
        }
        sql_insert_value += "'" + valorObj + "'";
        sql_update += "'" + valorObj + "'";

        break;

      case "boolean":
        var value_s = valorObj;

        if (value_s == "null") {
          sql_insert_value += " null ";
          sql_update += " null ";
        } else {
          sql_insert_value += "'" + valorObj + "'";
          sql_update += "'" + valorObj + "'";
        }

        break;

      case "double":
        var value_s = valorObj;

        if (value_s == "null") {
          sql_insert_value += " null ";
          sql_update += " null ";
        } else {
          sql_insert_value += parseFloat(value_s + "");
          sql_update += parseFloat(value_s + "");
        }

        break;
      case "json":
        var value_s = corrigirString(JSON.stringify(obj[nome]));

        if (value_s == "null") {
          sql_insert_value += " null ";
          sql_update += " null ";
        } else {
          sql_insert_value += "E'" + value_s + "'";
          sql_update += "E'" + value_s + "'";
          // sql_insert_value += "E'" + value_s + "'";
          // sql_update +=  "E'" + value_s + "'";
        }

        // sql_insert_value += "E'" + value_s + "'";
        // sql_update += "E'" + value_s + "'";
        break;

      case "array_pg":
        var value_s = JSON.stringify(obj[nome]);
        // value_s = replaceAll(value_s, "[", "'{");
        // value_s = replaceAll(value_s, "]", "}'");
        if (value_s == "null") {
          sql_insert_value += " null ";
          sql_update += " null ";
        } else {
          // sql_insert_value += "E'" + value_s + "'";
          // sql_update +=  "E'" + value_s + "'";
          sql_insert_value += "E'" + value_s + "'";
          sql_update += "E'" + value_s + "'";
        }
        // sql_insert_value +=  "E'" + value_s+ "'";;
        // sql_update +=  "E'" + value_s+ "'";;
        break;
      case "array":
        var value_s = JSON.stringify(obj[nome]);
        // value_s = replaceAll(value_s, "[", "'{");
        // value_s = replaceAll(value_s, "]", "}'");
        //
        if (value_s == "null") {
          sql_insert_value += " null ";
          sql_update += " null ";
        } else {
          sql_insert_value += "E'" + value_s + "'";
          sql_update += "E'" + value_s + "'";
          // sql_insert_value += "E'" + value_s + "'";
          // sql_update +=  "E'" + value_s + "'";
        }
        // sql_insert_value +=  "E'" + value_s+ "'";;
        // sql_update +=  "E'" + value_s+ "'";;
        // var value_s = corrigirString(JSON.stringify(obj[nome]));
        // //                    value_s = replace(value_s, '[', '{');
        // //                    value_s = replace(value_s, ']', '}');
        // value_s = value_s.substring(1, value_s.length - 1);
        // //                    value_s = value_s.substring(value_s.length-1,value_s.length);
        //
        // sql_insert_value += "E'{" + value_s + "}'";
        // sql_update += "E'{" + value_s + "}'";
        //                    log("'{" + value_s + "}'");
        break;

      default:
        //                    console.log(obj[nome]);
        var value_s = corrigirString(obj[nome]);
        //                    console.log(value_s);
        //                     value_s = replaceAll(value_s, "'", " ");
        if (value_s == "null") {
          sql_insert_value += " null ";
          sql_update += " null ";
        } else {
          sql_insert_value += "E'" + value_s + "'";
          sql_update += "E'" + value_s + "'";
        }

        break;
    }
    //   } else {
    //     switch (colunas[nome]) {
    //       case'objectId':
    //       sql_insert_value += "default";
    //       break;
    //       case'id':
    //       sql_insert_value += "default";
    //       break;
    //       case'updatedAt':
    //       sql_insert_value += "'" + new Date().toISOString() + "'";
    //       sql_update += "'" + new Date().toISOString() + "'";
    //       break;
    //       default :
    //       sql_insert_value += 'null';
    //       sql_update += 'null';
    //       break;
    //     }
    //   }
  }
  if (obj.objectId && obj.objectId >= 1) {
    sql_update += ' where  "objectId" = \'' + obj.objectId + "'  RETURNING * ";
    return sql_update;
  } else if (obj._id && parseInt(obj._id) >= 1) {
    sql_update += ' where  "_id" = \'' + obj._id + "'  RETURNING * ";
    return sql_update;
  } else {
    return sql_insert + ")" + sql_insert_value + " ) RETURNING * ;";
  }
}

function processarAlteracaoSql(obj, entidade, retorno) {
  var data = {};
  var lista = Object.keys(obj);
  for (var i = 0; i < lista.length; i++) {
    var nome = lista[i];
    var valorObj = obj[nome] + "";

    if (valorObj == "undefined") {
      continue;
    } else {
      if (nome === "updatedAt") {
        data[nome] = "updatedAt";
      } else if (nome === "createdAt") {
        data[nome] = "createdAt";
      } else if (nome === "objectId") {
        data[nome] = "objectId";
      } else if (isArray(obj[nome])) {
        data[nome] = "array_pg";
      } else if (isObject(obj[nome])) {
        data[nome] = "json";
      } else if (isBoolean(obj[nome])) {
        data[nome] = "boolean";
      } else if (isDate(obj[nome])) {
        data[nome] = "date";
      } else if (isNumber(obj[nome])) {
        data[nome] = "number";
      } else {
        data[nome] = "text";
      }
    }
  }

  function getSql(obj, entidade) {
    var sql = "";
    try {
      switch (entidade) {
        default:
          sql = MontarInsert(obj, data, entidade);
          break;
      }
    } catch (e) {
      console.log(e);
      if (debug) {
        console.log(obj);
      }
    }

    retorno(escape(sql));
  }
  getSql(obj, entidade);
}

exports.updateColunas = function(data, entidade, colunas, retorno,tratandoErro) {
  if (!entidade) {
    entidade = "base";
  }
  var sql = MontarInsert(data, colunas, entidade);
  if (debug) {
    console.log(sql);
  }
  var client = getPgCliente();
  client.query(sql, function(err, result) {
    //        client.end();
    if (err) {
      console.error(err);
      if (tratandoErro != true) {
        // console.log("-------------------------------------------- \n");
        corrigirErrosBanco(entidade, data, function() {
          updateColunas(data, entidade,colunas, retorno, true);
        });
      } else {
        if (retorno) {
          retorno(data);
        }
      }
    }
    // if (result && result.rows && result.rows[0]) {
      // retorno(result.rows[0]);
      if (result && result.rows && result.rows[0]) {
        var objTemp = result.rows[0];
        if (!objTemp.objectId) {
          objTemp.objectId = "" + objTemp._id;
          exe("update " + entidade + ' set  "objectId" = \'' + objTemp.objectId + "' where _id= " + objTemp._id, function() {
            if (retorno) {
              retorno(objTemp);
            }
          });
        } else {
          if (retorno) {
            retorno(objTemp);
          }
        }
      // } else {
      //   if (retorno) {
      //     retorno(data);
      //   }
      // }
    } else {
      retorno({});
    }
  });
};

exports.salvar = function salvar(data, entidade, retorno, tratandoErro) {
  // console.log(data);
  if (!entidade) {
    entidade = "base";
  }
  if (data.entidade && data.entidade == entidade) {
    delete data.entidade;
  }
  // if(!data.objectId && data._id){
  //   data.objectId = ""+data._id;
  // }
  processarAlteracaoSql(data, entidade, function(sql) {
    if (debug) {
      console.log(sql);
    }

    var client = getPgCliente();
    client.query(sql, function(err, result) {
      if (err) {
        console.log(err);
        // console.log("-------  tratar erro \n");
        if (tratandoErro != true) {
          // console.log("-------------------------------------------- \n");
          corrigirErrosBanco(entidade, data, function() {
            salvar(data, entidade, retorno, true);
          });
        } else {
          if (retorno) {
            retorno(data);
          }
        }
      } else {
        if (result && result.rows && result.rows[0]) {
          var objTemp = result.rows[0];
          if (!objTemp.objectId) {
            objTemp.objectId = "" + objTemp._id;
            exe("update " + entidade + ' set  "objectId" = \'' + objTemp.objectId + "' where _id= " + objTemp._id, function() {
              if (retorno) {
                retorno(objTemp);
              }
            });
          } else {
            if (retorno) {
              retorno(objTemp);
            }
          }
        } else {
          if (retorno) {
            retorno(data);
          }
        }
      }

      //            client.end();
    });
  });
};

exports.exeSql = function(sql, retorno) {
  if (debug) {
    console.log(sql);
  }
  var client = getPgCliente();
  client.query(sql, function(err, result) {
    if (err) {
      // console.error(err);
      console.log("exeSql", sql);
    }
    if (result && result.rows) {
      retorno(result.rows);
    } else {
      retorno({
        error: "sem retorno no salvar"
      });
    }
    //            client.end();
  });
};

exports.salvarLista = function(lista, entidade, retorno) {
  if (!entidade) {
    entidade = "base";
  }
  if (lista && lista.length > 0) {
    var possicao;
    var resultados;
    var client;
    (function() {
      var proSalvar = function() {
        if (possicao < lista.length) {
          processarAlteracaoSql(lista[possicao], entidade, function(sql) {
            possicao++;
            client.query(sql, function(err, result) {
              //                        client.end();
              if (err) {
                console.log(sql);
                console.error(err);
              }
              if (result && result.rows && result.rows[0]) {
                resultados.push(result.rows[0]);
              }
              proSalvar();
            });
          });
        } else {
          retorno(resultados);
        }
      };

      possicao = 0;
      resultados = [];
      client = getPgCliente();
      proSalvar();
    })();
  }
};

function exe(sql, retorno) {
  if (debug) {
    console.log(sql);
  }
  var client = getPgCliente();
  client.query(sql, function(err, result) {
    if (err) {
    }
    retorno(result);
  });
}
//  var sql = "ALTER TABLE "+entidade+"  ADD COLUMN " + nome +" text ";
function corrigirErrosBanco(entidade, obj, callback) {
  var criar =
    "CREATE TABLE IF NOT EXISTS " +
    entidade +
    " ( " +
    ' "objectId" character varying ,  ' +
    ' "createdAt"   timestamp with time zone DEFAULT now() ,  ' +
    ' "updatedAt"  timestamp with time zone DEFAULT now() ,  ' +
    // + ' "createdAt"  character varying ,  '
    // + ' "updatedAt"  character varying ,  '
    " status int DEFAULT 1 ,  " +
    " _id serial  " +
    "  ); ";
  exe(criar, function() {
    tratarErroColunas(entidade, obj, callback);
  });
}

function tratarErroColunas(entidade, obj, callback) {
  var lista = Object.keys(obj);
  if (debug) {
    console.log(lista, obj);
  }

  loopColunas(0, obj, entidade, lista, function() {
    callback();
  });
}

function loopColunas(pos, obj, entidade, lista, callback) {
  if (pos >= lista.length) {
    callback();
    return;
  } else {
    var sql = "";
    var nome = lista[pos];
    var value = obj[nome];
    if (nome == "_id" || value + "" == "undefined" || nome == "objectId" || nome == "createdAt" || nome == "updatedAt" || nome == "status" || nome + "" == "undefined" || !nome) {
      pos = pos + 1;
      loopColunas(pos, obj, entidade, lista, callback);
      return;
    }
    if (value + "" == "null") {
      sql += "ALTER TABLE " + entidade + '  ADD COLUMN "' + nome + '"   character varying ; ';
    } else if (asPrefixado(nome)) {
      if (asPrefixado(nome) == "sql") {
        pos = pos + 1;
        loopColunas(pos, obj, entidade, lista, callback);
        return;
      }
      sql += "ALTER TABLE " + entidade + '  ADD COLUMN "' + nome + '" ' + asPrefixado(nome) + " ; ";
    } else {
      if (isArray(value)) {
        sql += "ALTER TABLE " + entidade + '  ADD COLUMN "' + nome + '"  json; ';
      } else if (isObject(value)) {
        sql += "ALTER TABLE " + entidade + '  ADD COLUMN "' + nome + '"   json; ';
      } else if (isBoolean(value)) {
        sql += "ALTER TABLE " + entidade + '  ADD COLUMN "' + nome + '"   boolean; ';
      } else if (isInteger(value)) {
        sql += "ALTER TABLE " + entidade + '  ADD COLUMN "' + nome + '"   integer; ';
      } else if (isNumber(value)) {
        sql += "ALTER TABLE " + entidade + '  ADD COLUMN "' + nome + '"   double precision; ';
      } else if (isDate(value)) {
        sql += "ALTER TABLE " + entidade + '  ADD COLUMN "' + nome + '"   timestamp with time zone; ';
      } else {
        sql += "ALTER TABLE " + entidade + '  ADD COLUMN "' + nome + '"   character varying ; ';
      }
    }

    // console.log(sql);
    exe(sql, function() {
      pos = pos + 1;
      loopColunas(pos, obj, entidade, lista, callback);
    });
  }
}

function stringStartsWith(string, prefix) {
  return prefix && string.slice(0, prefix.length) == prefix;
}

function stringEndsWith(string, suffix) {
  return suffix && string.slice(-suffix.length) == suffix;
}

function isUpperCase(strings, pos) {
  if (!strings) {
    return false;
  }
  if (strings.charAt(pos) && strings.charAt(pos) == strings.charAt(pos).toUpperCase()) {
    return true;
  } else {
    return false;
  }
}
//inte - doub - array - bool - tmst - date - text - json
function asPrefixado(nome) {
  if ((nome.length > 4 && isUpperCase(nome, 4)) || (nome.length > 4 && isUpperCase(nome, 3))) {
    var prefixo = nome.substring(0, 4);
    if (isUpperCase(nome, 3)) {
      prefixo = nome.substring(0, 3);
    }
    if (prefixo == "inte" || prefixo == "int") {
      return " integer ";
    } else if (prefixo == "json") {
      return " json ";
    } else if (prefixo == "key") {
      return " integer ";
    } else if (prefixo == "array") {
      return " json ";
    } else if (prefixo == "bool") {
      return " boolean ";
    } else if (prefixo == "doub" || prefixo == "dou") {
      return " double precision ";
    } else if (prefixo == "tmst") {
      return " timestamp with time zone ";
    } else if (prefixo == "date") {
      return " date  ";
    } else if (prefixo == "sql") {
      return "sql";
    } else if (prefixo == "text" || prefixo == "txt") {
      return " text ";
    }
  } else {
    return false;
  }
}

function getTypeValue(nome) {
  if (nome.length > 4 && isUpperCase(nome, 4)) {
    var prefixo = nome.substring(0, 4);
    if (prefixo == "inte") {
      return "int";
    } else if (prefixo == "int") {
      return "int";
    } else if (prefixo == "key") {
      return "int";
    } else if (prefixo == "json") {
      return "json";
    } else if (prefixo == "array") {
      return "json";
    } else if (prefixo == "bool") {
      return "boolean";
    } else if (prefixo == "doub") {
      return "double";
    } else if (prefixo == "tmst") {
      return "timestamp";
    } else if (prefixo == "date") {
      return "date";
    } else if (prefixo == "text") {
      return "text";
    }
  } else {
    return false;
  }
}

function isObject(val) {
  return typeof val === "object";
}

function isArray(object) {
  if (object && JSON.stringify(object) == "[]") {
    return true;
  }
  if (object && object.constructor && object.constructor === Array) {
    return true;
  } else {
    return false;
  }
}

function isNumber(value) {
  if (Number(value) + "" == "NaN") {
    return false;
  } else {
    return true;
  }
}

function isInteger(value) {
  if (Number(value) + "" == "NaN") {
    return false;
  } else {
    if (parseInt(value) == Number(value)) {
      return true;
    } else {
      return false;
    }
  }
}

function isBoolean(value) {
  if (value + "" == "true" || value + "" == "false") {
    return true;
  } else {
    return false;
  }
}

function isDate(value) {
  if (value && value instanceof Date) {
    return true;
  }
  if (value && conteString(value, "T") && stringEndsWith(value, "Z") && conteString(value, ":")) {
    return true;
  } else {
    return false;
  }
}

function conteString(string, key) {
  if (!string || !key) {
    return false;
  }
  try {
    string = string + "";
    if (string && string.indexOf(key) >= 0) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}
//  ssl: true
// console.log("erro exe:",sql);
// console.error(err);
