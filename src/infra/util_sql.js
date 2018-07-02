// const escapeString = require("sql-string-escape");
var SqlString = require("sqlstring");
import fs from "fs";
export function select(sql, values) {
  var entradas = [];
  for (let i = 0; i < values.length; i++) {
    let value = values[i];

    entradas.push(value);
  }
  var sql = SqlString.format(sql, entradas);
  return sql;
}

export function insert(tabela, fields, data) {
  var entradas = [];
  var resultInsert = "insert into " + tabela + " (";
  var resultValues = " values ( ";
  var contador = 0;
  for (let i = 0; i < fields.length; i++) {
    let nome = fields[i];
    var value = data[nome];
    if (value == undefined) continue;
    var escape = false;
    if (isObject(value) || isArray(value)) {
      value = JSON.stringify(value);
      escape = true;
    } else if (isString(value)) {
      escape = true;
    }
    entradas.push(value);
    if (contador > 0) {
      resultInsert += ", ";
      resultValues += ", ";
    }
    resultInsert += ' "' + nome + '" ';
    resultValues += escape ? "E?" : " ? ";
    contador++;
  }
  resultInsert += " ) ";
  resultValues += " )  RETURNING * ";

  var sql = SqlString.format(resultInsert + resultValues, entradas);
  return sql;
}

export function update(tabela, fields, data, where) {
  var entradas = [];
  var resultUpdate = "update " + tabela + " set ";
  var contador = 0;

  for (let i = 0; i < fields.length; i++) {
    let nome = fields[i];
    var value = data[nome];
    if (value == undefined) continue;

    var escape = false;
    if (isObject(value) || isArray(value)) {
      value = JSON.stringify(value);
      escape = true;
    } else if (isString(value)) {
      escape = true;
    }
    entradas.push(value);
    if (contador > 0) {
      resultUpdate += ", ";
    }
    resultUpdate += ' "' + nome + '" = ' + (escape ? "E?" : " ? ");
    contador++;
  }
  resultUpdate += "    " + (where ? where : "") + " RETURNING * ";

  var sql = SqlString.format(resultUpdate, entradas);
  return sql;
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
function isString(value) {
  return typeof value == "string";
}

var dataSqlMemory = {};
export function getSql(path) {
  if (dataSqlMemory[path]) {
    return dataSqlMemory[path];
  }
  try {
    var buf = fs.readFileSync("./out/sql/" + path + ".sql", "utf8");
    dataSqlMemory[path] = buf;
    return buf;
  } catch (e) {
    console.log(e);
    return "";
  }
}
