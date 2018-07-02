var pg = require("pg");
var listClient = [];
var escape = require("pg-escape");
var moment = require("moment");
var database = "projeto";
var debug = true;
var port = 5432;
var password = "";
var user = "";
var cotador = 0;
var contador2 = 0;
var listEspera = [];
var limit = 5;
var limitMaximo = 120;
var host_db = "localhost";

exports.setDatabase = function(host, nome, PUser, Ppassword) {
  password = Ppassword;
  host_db = host;
  user = PUser;
  database = nome;
  database = database ? database.toLowerCase() : "data";
  initClient();
};
function conetCliente(callback) {
  cotador++;
  let cf = {
    user: user,
    password: password,
    database: database,
    port: port,
    host: host_db
  };
  // console.log(cf);
  console.log(process.env.POSTGRES_PASSWORD) ;
  console.log(user,password,database,port,host_db)
// var database = process.env.POSTGRES_DB || "plataforma";
// var password = process.env.POSTGRES_PASSWORD || "999f9e829f17128a11af9f6390105142";
// var user = process.env.POSTGRES_USER || "app";
// var host = process.env.HOST_DB || "localhost";

  let client = new pg.Client(cf);
  // console.log(client._connecting);
  client.connect(err => {
    if (err) console.log(err);
    //tratar erro se tiver
    callback(client);
  });
}

exports.setDebug = function(status) {
  debug = status;
};
exports.setPort = function(pt) {
  port = pt;
};
function initClient() {
  for (var i = 0; i < limit; i++) {
    novoCliente(() => {});
  }
  kill();
}
function kill() {
  setInterval(function() {
    killClient();
  }, 30000);
}
function gereteClientes(callback) {
  gereteClientes2(callback);
}

function listaDeEspera(callback) {
  if (listEspera[0]) {
    callback(listEspera[0].requisicao);
    listEspera.splice(0, 1);
  } else {
    callback();
  }
}

function gereteClientes2(callback) {
  var novoClt = true;
  function proximo(pos) {
    if (pos < listClient.length) {
      let item = listClient[pos];
      if (!item.emUso) {
        novoClt = false;
        ativarUso(item);
        callback(item);
      } else {
        pos++;
        proximo(pos);
      }
    } else if (listClient.length < limitMaximo) {
      if (novoClt) {
        novoCliente(item => {
          console.log(3, "novo");
          ativarUso(item);
          if (callback) {
            callback(item);
          }
        });
      }
    } else {
      console.log(4, "fila");
      // console.log(8888);
      listEspera.push({ requisicao: callback });
    }
  }
  proximo(0);
}
exports.testsCliente = function(item) {
  testCliente(item);
};
function testCliente(item) {
  ativarUso(item);
  var testTempo = true;
  var test = false;
  item.client.query("select _id from  user_local  limit 1", function(err, result) {
    if (err) {
      testTempo = false;
      item.delete = true;
    } else if (result) {
      // console.log("test",3);
      testTempo = false;
      desativarUso(item);
    }
  });
  setTimeout(function() {
    // console.log("test",4);
    if (testTempo) {
      item.delete = true;
    }
  }, 6000);
}
function novoCliente(callback) {
  conetCliente(client => {
    var item = { emUso: false, client: client };
    // console.log("novos",listClient.length);
    //
    listClient.push(item);
    callback(item);
  });
}
function ativarUso(item) {
  item.emUso = true;
  item.temp = moment();
}
function desativarUso(item) {
  listaDeEspera(requisicao => {
    if (requisicao) {
      requisicao(item);
    } else {
      item.emUso = false;
    }
  });
  // item.temp=false;
}
exports.desativarItemUso = function(item) {
  desativarUso(item);
};
function killClient() {
  // console.log("killClient" ,listClient.length,cotador,contador2);
  var uso = 0;
  var removidos = 0;
  try {
    if (listClient && listClient.length > limit) {
      // var listDelete =[];
      for (var i = 0; i < listClient.length; i++) {
        var item = listClient[i];
        if ((!item.emUso && listClient.length > limit) || item.delete) {
          item.client.end();

          // listDelete.push(item);
          listClient.splice(i, 1);
          removidos++;
        } else if (item.emUso && item.temp) {
          var test = item.temp.diff(moment(), "seconds");
          if (test < -100) {
            // item.emUso=false
            testCliente(item);
            // item.client.end();
            // listDelete.push(item);
            // listClient.splice(i,1);
          }
        }

        if (item.emUso) {
          uso++;
        }
      }
      // for (var i = 0; i < listDelete.length; i++) {
      //   var item =  listDelete[i];
      //   item.client.end();
      // }
      console.log("-----> status cliente", " Clientes:" + listClient.length, "Em uso:" + uso, " Clientes fechados:" + removidos, " Total de clientes usados:" + cotador, "<--------");
    }
  } catch (e) {
  } finally {
  }
}

exports.getClientNew = function(callback) {
  gereteClientes2(item => {
    // contador2++
    // callback(null)
    // console.log(4);
    callback(item);
  });
  // conetCliente((client)=>{
  //   callback(client)
  // });
};
exports.first = function(sql, callback) {
  if (debug) {
    console.log(sql + "\n");
  }
  gereteClientes2(item => {
    item.client.query(sql, function(err, result) {
      desativarUso(item);
      if (err) {
        testCliente(item);
      }
      if (result && result.rows) {
        if (callback) {
          callback(result.rows[0]);
        }
      } else {
        if (callback) {
          callback(null);
        }
      }
    });
  });
};

exports.query = function(sql, callback) {
  if (debug) {
    console.log(sql + "\n");
  }
  gereteClientes2(item => {
    item.client.query(sql, function(err, result) {
      if (err) {
        testCliente(item);
      } else {
        desativarUso(item);
      }
      callback(err, result);
    });
  });
};

exports.select = function(sql, callback) {
  if (debug) {
    console.log(sql + "\n");
  }
  gereteClientes2(item => {
    item.emUso = true;
    item.client.query(sql, function(err, result) {
      // item.client.end()
      desativarUso(item);
      //console.log(result)

      if (err) {
        testCliente(item);
      }
      if (result && result.rows) {
        if (callback) {
          callback(result.rows);
        }
      } else {
        if (callback) {
          callback([]);
        }
      }
    });
  });
};
