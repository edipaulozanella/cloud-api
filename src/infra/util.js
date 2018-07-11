var make_token = require("jsonwebtoken");

exports.parseToken = function(token) {
  try {
    var decoded = make_token.verify(token, "abrate");
    return decoded;
  } catch (err) {
    return false;
  }
};
exports.makeToken = function(obj) {
  var token = make_token.sign(obj, "abrate", { noTimestamp: true });
  return token;
};

exports.getToken = function(req) {
  if (req.headers && req.headers["token-user"]) {
    return req.headers["token-user"];
  } else {
    return null;
  }
};

exports.verifyToken = function(req) {
  if (req.headers && req.headers["token-user"]) {
    try {
      return make_token.verify(req.headers["token-user"], "abrate");
    } catch (err) {
      return false;
    }
  }
  return null;
};
exports.getUserFromToken = function(req) {
  if (req.headers && req.headers["token-user"]) {
    try {
      return make_token.verify(req.headers["token-user"], "abrate");
    } catch (err) {
      return false;
    }
  }
  return null;
};

exports.capitalizar = function(string) {
  if (!string) {
    return "";
  }
  string = string.toLowerCase();
  return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.subString = function(string, pos) {
  if (!string) {
    return "";
  }
  if (!pos) {
    return string;
  }
  var re = "";
  // if (contemString(string, "#")) {
  //   var numero = string.split("#")[1];
  var pos = parseInt(pos + "");
  if (pos < string.length - 1) {
    re = string.substring(0, pos) + "...";
  } else {
    re = string;
  }
  // }
  return re;
};

exports.replace = function(string, de, para) {
  var varString = new String(string);
  var cString = new String();
  var varRes = "";
  for (a = 0; a < varString.length; a++) {
    cString = varString.substring(a, a + 1);
    if (cString === de) {
      cString = para;
    }
    varRes += cString;
  }
  return varRes;
};

exports.montarObjeto = function(obj) {
  //    console.log(obj);
  if (!obj) {
    return {};
  }
  var novo = obj.dados;
  if (!novo) {
    novo = {};
  }
  var lista = Object.keys(obj);
  for (var i = 0; i < lista.length; i++) {
    var nome = lista[i];
    if (nome !== "dados") {
      novo[nome] = obj[nome];
    }
  }
  return novo;
};

exports.removerAcentos = function(s) {
  if (!s) {
    return "";
  }
  var r = s.toLowerCase();
  r = r.replace(new RegExp(/\s/g), "_");
  r = r.replace(new RegExp(/[àáâãäå]/g), "a");
  r = r.replace(new RegExp(/æ/g), "ae");
  r = r.replace(new RegExp(/ç/g), "c");
  r = r.replace(new RegExp(/[èéêë]/g), "e");
  r = r.replace(new RegExp(/[ìíîï]/g), "i");
  r = r.replace(new RegExp(/ñ/g), "n");
  r = r.replace(new RegExp(/[òóôõö]/g), "o");
  r = r.replace(new RegExp(/œ/g), "oe");
  r = r.replace(new RegExp(/[ùúûü]/g), "u");
  r = r.replace(new RegExp(/[ýÿ]/g), "y");
  r = r.replace(new RegExp(/\W/g), "");
  return r;
};
exports.path = function(s) {
  if (!s) {
    return "";
  }
  var r = s.toLowerCase();
  r = r.replace(new RegExp(/\s/g), "_");
  r = r.replace(new RegExp(/[àáâãäå]/g), "a");
  r = r.replace(new RegExp(/æ/g), "ae");
  r = r.replace(new RegExp(/ç/g), "c");
  r = r.replace(new RegExp(/[èéêë]/g), "e");
  r = r.replace(new RegExp(/[ìíîï]/g), "i");
  r = r.replace(new RegExp(/ñ/g), "n");
  r = r.replace(new RegExp(/[òóôõö]/g), "o");
  r = r.replace(new RegExp(/œ/g), "oe");
  r = r.replace(new RegExp(/[ùúûü]/g), "u");
  r = r.replace(new RegExp(/[ýÿ]/g), "y");
  // r = r.replace(new RegExp(/\W/g), "");
  return r;
};

exports.replaceAll = function(string, str, key) {
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
    return string.replace(new RegExp(str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g"), key);
  } catch (e) {
    return string;
  }
};

exports.montarSave = function(objeto, session, entidade) {
  if (entidade) {
    objeto.entidade = entidade;
  }
  if (session && session.cliente) {
    objeto.key_cliente = session.cliente.objectId;
  }

  if (session && session.user) {
    objeto.key_user = session.user.objectId;
  }
  if (objeto.dados && objeto.dados.objectId) {
    objeto.objectId = parseInt(objeto.dados.objectId + "");
  }

  return objeto;
};

exports.montarPreSelect = function(tabela, colunas) {
  var col = " * ";
  if (colunas && colunas.length > 0) {
    col = " objectId, entidade, createdAt, updatedAt , json_build_object( ";
    for (var i = 0; i < colunas.length; i++) {
      var foco = colunas[i];
      col += i > 0 ? " , " : "";
      col += " " + foco + " , dados->'" + foco + "' ";
    }
    col += ") as dados ";
  }
  var select = "SELECT " + col + " FROM " + tabela + "  ";

  console.log(select);
  return select;
};

exports.montarSelect = function(tabela, entidade, keyApp, colunas) {
  var col = " * ";
  if (colunas && colunas.length > 0) {
    col = " objectId, entidade, createdAt, updatedAt , json_build_object( ";
    for (var i = 0; i < colunas.length; i++) {
      var foco = colunas[i];
      col += i > 0 ? " , " : "";
      col += " " + foco + " , dados->'" + foco + "' ";
    }
    col += ") as dados ";
  }
  var select = "SELECT " + col + " FROM " + tabela + "  where " + ' "entidade"= \'' + entidade + "' and " + ' "key_app"= \'' + keyApp + "' and status = 1 " + ";";

  console.log(select);
  return select;
};

exports.log = function(obj) {
  try {
    console.log(JSON.stringify(obj));
  } catch (e) {}
};

exports.contemString = function(string, key) {
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
};

exports.parseColor = function(cor_hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cor_hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
};
exports.parseColorRGBAtoHEXAndroid = function(rgba) {
  if (!Uteis.conteString(rgba, "rgba")) {
    return "#00000000";
  }
  var st = rgba.replace("rgba(", "");
  st = st.replace(")", "");
  var val = st.split(",");
  function componentToHex(c) {
    if (!c) {
      return "00";
    }
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }
  return "#" + componentToHex(parseInt(val[3] * 255)) + componentToHex(parseInt(val[0])) + "" + componentToHex(parseInt(val[1])) + "" + componentToHex(parseInt(val[2]));
};
exports.parseColorRGBAtoObject = function(rgba) {
  var st = rgba.replace("rgba(", "");
  st = st.replace(")", "");
  var val = st.split(",");
  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }
  return {
    a: componentToHex(val[3]),
    r: componentToHex(val[0]),
    g: componentToHex(val[1]),
    b: componentToHex(val[2])
  };
};

exports.startsWith = function(string, key) {
  if (string) {
    string = string + "";
  }
  if (string && string.indexOf(key) === 0) {
    return true;
  } else {
    return false;
  }
};
exports.endWith = function(string, key) {
  if (string && string.indexOf(key, string.length - key.length) === 0) {
    return true;
  } else {
    return false;
  }
};

exports.isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};
exports.parseNumero = function(string) {
  try {
    string = string + "";
    var val = string.replace(",", ".");
    var nnn = parseFloat(val);
    //        return parseFloat(val);
    return nnn;
  } catch (e) {
    return 0.0;
  }
};
exports.parseNumeroDuasCasas = function(string) {
  try {
    string = string + "";
    var val = string.replace(",", ".");
    var nnn = parseFloat(val);
    var num = nnn.toFixed(2);
    //        return parseFloat(val);
    return num;
  } catch (e) {
    return 0.0;
  }
};
exports.capitalize = function(string) {
  if (!string || string === "") {
    return "";
  }
  string = string.toLowerCase();
  return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.cleanNumber = function(string) {
  try {
    string = string + "";
    // console.log(string);"de33sl".replace(/[^,.,0-9]/g, '')
    var val = string.replace(",", ".");
    val = val.replace(/[^,-.,0-9]/g, "");
    return val.trim();
  } catch (e) {
    // console.log(e);
    return "";
  }
};

exports.parseBoolean = function(string) {
  try {
    switch (string.toLowerCase()) {
      case "true":
        return true;
      case "yes":
        return true;
      case "1":
        return true;
      case "false":
        return false;
      case "no":
        return false;
      case "0":
        return false;
      case null:
        return false;
      default:
        return false;
    }
  } catch (e) {
    return false;
  }
};
exports.parseInt = function(string) {
  if (!string || string === "") {
    return 0;
  }
  try {
    var v = parseInt(string + "");
    if (!v) {
      v = 0;
    }
    return v;
  } catch (e) {
    //        alert(e);
    return 0;
  }
};
exports.parseInteger = function(string) {
  if (!string || string === "") {
    return 0;
  }
  try {
    var v = parseInt(string + "");
    if (!v) {
      v = 0;
    }
    return v;
  } catch (e) {
    //        alert(e);
    return 0;
  }
};
exports.parseReal = function(string) {
  try {
    string = string + "";
    var val = string.replace(",", ".");
    var nnn = parseFloat(string);
    var num = nnn.toFixed(2);
    var str = "" + num;
    var numero = "" + str.replace(".", ",");
    var vfinal = numero.replace(/[.]/g, ",").replace(/\d(?=(?:\d{3})+(?:\D|$))/g, "$&.");
    return vfinal;
  } catch (e) {
    return "0,00";
  }
};
