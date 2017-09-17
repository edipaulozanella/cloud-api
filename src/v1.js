"use strict";
import restify from 'restify';
import Banco from "./api/banco";
import Uteis from "./api/uteis";

export default class V1 {

  constructor(app) {

    app.post('/v1/salvar', function (req, res) {
      console.log(req.body);
      if(req.body.data && req.body.entidade){
        Banco.salvar(JSON.parse(req.body.data), req.body.entidade, function(re){
          res.send(re);
        });
      }else{
        res.send({error:"falha de parametros", body: req.body})
      }
    });

    app.post('/v1/sinc', function (req, res) {
      // console.log("sinc.....");
      var data = req.body;
      if (!data || !data.entidade) {
        res.send([]);
      }else{
        // console.log(data);
        var limit = 500;
        var skip = 0;
        if(data.limit){
          limit = parseInt(data.limit);
        }
        if(data.skip){
          skip = parseInt(data.skip);
        }
        var where = {};
        if(data.where){
          where = data.where;
        }
        var db = Banco.getDB();
        var collection = db.collection(data.entidade);
        if(collection){
          collection.find(where).sort({ updatedAt: 1 }).skip(skip).limit(limit).toArray(function (err, result) {
            if (err) {
              console.log(err);
              res.send([]);
            } else {
              for (var i = 0; i <  result.length; i++) {
                var item =result[i];
                Banco.normalizarObject(item);
              }
              console.log(result.length+"  : "+data.entidade);
              res.send(result);
            }
          });
        }else{
          res.send([]);
        }
      }
    });

    app.post('/v1/select', function (req, res) {
      var data = req.body;
      // console.log(data);
      if (!data || !data.entidade) {
        res.send([]);
      }else{
        Banco.getListaWhere(data.entidade, data.where , function(lista){
          res.send(lista);
        });
      }
    });

    app.post('/v1/getAll', function (req, res) {
      var data = req.body;
      console.log(data);
      if (!data || !data.entidade) {
        res.send([]);
      }else{
        var ordem = {};
        if(data.ordem){
          ordem = data.ordem;
        }
        var where = {};
        if(data.where){
          where = data.where;
        }
        var limit = 2000;
        if(data.limit){
          limit = data.limit;
        }


        var db = Banco.getDB();
        var collection = db.collection(data.entidade);
        if(collection){

          if(where.point && where.point.$nearSphere){
            collection.ensureIndex({point:"2dsphere"});
            collection.find(where ,function (err, cursor) {
              cursor.limit(limit);
              cursor.toArray(function (err, result) {
                if (err) {  console.log(err); res.send([]);  } else {
                  for (var i = 0; i <  result.length; i++) {
                    var item =result[i];
                    Banco.normalizarObject(item);
                  }
                  res.send(result);
                }
              });
            });
          }else{
            collection.find(where).sort(ordem).limit(limit).toArray(function (err, result) {
              if (err) {  console.log(err);  res.send([]);  } else {
                for (var i = 0; i <  result.length; i++) {
                  var item =result[i];
                  Banco.normalizarObject(item);
                }
                // console.log(result.length+"  : "+data.entidade);
                res.send(result);
              }
            });
          }
        }else{
          res.send([]);
        }

      }
    });
  }
}
