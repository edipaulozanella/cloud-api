"use strict";
import restify from 'restify';
import Banco from "./api/banco";



export default class V1 {

  constructor(app) {

    app.post('/v1/salvar', function (req, res) {
      // console.log(req.body);
      if(req.body.data && req.body.entidade){
        var data = JSON.parse(req.body.data);
        console.log(data);
        Banco.salvar(data, req.body.entidade, function(re){
          res.send(re);
        });
      }else{
        res.send({error:"falha de parametros", body: req.body})
      }
    });


    app.post('/v1/getAll', function (req, res) {
      var data = req.body;
      console.log('/v1/getAll',data);
      if (!data || !data.entidade) {
        res.send([]);
      }else{
        var ordem = data.ordem ? data.ordem : {};
        var where = data.where ? data.where : {};
        var limit =  data.limit ? data.limit : 2000;
        var sql = "select * from "+data.entidade+" "+Banco.makeSql(where,ordem,limit);
        console.log(sql);
        Banco.select(sql,(lista)=>{
          res.send(lista)
        });

      }
    });
  }
}
