
// var uristring =  'mongodb://heroku_8p3sk3mr:l8k8prvcff3a9qtv5abmbtikse@ds139715.mlab.com:39715/heroku_8p3sk3mr';

// var mongoose = require('mongoose');
var ObjectId=require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;

var database = "projeto";
exports.setDatabase = function (nome) {
  database = nome;
  database = database? database.toLowerCase(): "data";
  var uristring =  'mongodb://localhost:27017/'+database;

  MongoClient.connect(uristring, function(err, connection) {
    if(err) { return console.dir(err); }
    db = connection
    console.log(uristring);
    db.on('error',function(e){
      console.log(e);
      try{
        mongoose.connect(uristring);
      }catch(e){
        MongoClient.connect(uristring,this);
      }
    });
  });

}

var db = null;



function getData(entidade,where, retorno) {
  if (!where) {
    where ={};
  }
  // console.log(where);
  // console.log(entidade);
  var collection = db.collection(entidade);
  if(collection){
    collection.find(where).limit(1).toArray(function (err, result) {
      // console.log(results);
      if (err) {
        console.log(err);
        retorno([]);
      } else {
        if (result[0]) {
          retorno(normalizarObject(result[0]));
        }else{
          retorno(null);
        }
      }
    });
  }else{
      retorno(null);
  }
};
function normalizarObject(item){
  if (item && item._id) {
    if(!item.objectId){
      item.objectId = item._id+"";
    }
    item._id =  item._id+"";
  }
  return item;
}

function salvar (data, entidade, retorno) {
  if (data._id) {
    // updateObj(data, entidade,{ "_id": data._id } , retorno);
    updateObj(data, entidade,{ "_id":  ObjectId(data._id) } , retorno);
  }else{
    var collection = db.collection(entidade);
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    collection.insert([data], function (err, re) {
      if (err) {
        console.log(err);
        retorno({});
      } else {
        var item  =re.ops[0];
        var itemSave = normalizarObject(item);
        updateObj(itemSave, entidade,{ "_id":  ObjectId(itemSave._id) } , function(){
          retorno(itemSave);
        });
      }
    });
  }
}

function updateObj(data,entidade,where,retorno){
  var collection = db.collection(entidade);
  var _id = data._id;
  delete data._id;
  data.updatedAt = new Date().toISOString();

  collection.update(where, data, function (err, numUpdated) {
    if (err) {
      console.log(err);
      data._id = _id;
      retorno(data);
    }  else{
      data._id = _id;
      retorno(data);
    }
  });
}



exports.salvarLista = function (lista, entidade, retorno) {
  // var collection = db.collection(entidade);
  // collection.insert(lista, function (err, re) {
  //   if (err) {
  //     retorno({});
  //   } else {
  //     var lista =re.ops;
  //     for (var i = 0; i <  lista.length; i++) {
  //       normalizarObject(lista[i]);
  //     }
  //     retorno(lista);
  //   }
  // });
}
//.limit( 5 )

function getLista(entidade, retorno) {
  var collection = db.collection(entidade);
  collection.find().toArray(function (err, result) {
    if (err) {
      console.log(err);
      retorno([]);
    } else {
      for (var i = 0; i <  result.length; i++) {
        normalizarObject(result[i]);
      }
      retorno(result);
    }
  });
};
function getListaWhereOrder(entidade,where,order, retorno) {
  var collection = db.collection(entidade);
  collection.find().sort(order).toArray(function (err, result) {
    if (err) {
      console.log(err);
      retorno([]);
    } else {
      for (var i = 0; i <  result.length; i++) {
        normalizarObject(result[i]);
      }
      retorno(result);
    }
  });
};

exports.abrirBanco = function(){
  mongoose.connect(uristring);
}

exports.getListaWhere = function (entidade, where, retorno) {
  if (!where) {
    getLista(entidade,retorno);
    return;
  }
  var collection = db.collection(entidade);

  collection.find(where).toArray(function (err, result) {
    if (err) {
      console.log(err);
      retorno([]);
    } else {
      for (var i = 0; i <  result.length; i++) {
        normalizarObject(result[i]);
      }
      retorno(result);
    }
  });
};

exports.first = function (data,entidade,callback){
    getData(entidade,data,callback);
}

exports.getListaWhereOrder = getListaWhereOrder;
exports.normalizarObject = normalizarObject;
exports.getData = getData;
exports.getLista = getLista;
exports.salvar = salvar;
exports.updateObj = updateObj;
exports.getDB = function(){
  return db;
};
 