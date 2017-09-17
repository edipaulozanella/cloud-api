"use strict"; 
import restify from 'restify';
import Banco from "./api/banco";
var PushNotification = require('./api/notification');

export default class Msg {


  constructor(app) {


    app.post('/v1/sendMsgChat', function (req, res) {

    });

    app.post('/v1/chatLer',  (req, res)=> {

    });

    app.post('/v1/chats',  (req, res)=> {

    });



    app.post('/v1/notification', function (req, res) {
      if(req.body.data && req.body.entidade){
        Banco.salvar(JSON.parse(req.body.data), req.body.entidade, function(re){
          console.log(re);
          var not = {    alert:re.alert , dest: re.dest ? re.dest : {tipo:"geral"}    };

          Banco.getListaWhere("instalacoes", {  } , function(lista){
            console.log(lista);
            PushNotification.enviarNotificacao(not,lista,function(){
              console.log(not);
              res.send(re);
            });
          });

        });
      }else{
        res.send({error:"falha de parametros", body: req.body})
      }
    }); 


    app.post('/v1/instalacao',  (req, res) =>{
      var objeto = req.body.data;
      if(!objeto){
        objeto = req.body.objeto;
      }else{
        objeto =  JSON.parse(req.body.data);
      }
      // console.log(req.body);
      if(!objeto || !objeto.token ){
        res.send(objeto);
        return;
      }
      //      console.log(objeto);
      var token = objeto.token;
      try {
        Banco.getData("instalacoes", {token:token} , (data)=>{
          if (data) {
            objeto._id = data._id+"";
            objeto.objectId = data._id +"";
            // objeto.createdAt = data.createdAt+"";
            objeto.updatedAt = new Date().toISOString();
          }else{
            objeto.createdAt = new Date().toISOString();
            objeto.updatedAt = new Date().toISOString();
            delete objeto._id;
            delete objeto.objectId;
          }
          Banco.salvar(objeto, "instalacoes", (re)=>{
            re.objectId = re._id;
            // console.log(re);
            res.send(re);
          });
        });

      } catch (e) {
        console.log(e);
      }

    });
  }
}
