# yarn
# yarn start
# yarn watch

[https://www.npmjs.com/package/mongodb]
```js

var ObjectId=require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var db = null;

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


function getData(entidade,where, retorno) {
  if (!where) {
    where ={};
  }
   var collection = db.collection(entidade);
  if(collection){
    collection.find(where).limit(1).toArray(function (err, result) {
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

function salvar (data, entidade, retorno) {
  if (data._id) {
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
```
