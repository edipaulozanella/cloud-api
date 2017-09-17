"use strict"; 
import restify from 'restify';
import Banco from "./api/banco";
import Uteis from "./api/uteis";
var PushNotification = require('./api/notification');
var request = require("request");
var random = require("random-js")();

export default class Login {

  constructor(app) {
    app.post('/v1/loginFacebook', function (req, res) {
      var token = req.body.fb_token;
      var device_token = req.body.device_token;
      var url = "https://graph.facebook.com/v2.5/me?fields=id,name,email,gender&access_token="+token;
      request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var obj = JSON.parse(body);

          // getUserApp(obj, function(item){
          Banco.getData("user_local", {id_facebook:obj.id+""} , function(item){
            // console.log(item);
            if(!item){
              item ={id_facebook:obj.id+""};
            }
            item.imagem_small = "https://graph.facebook.com/"+obj.id+"/picture?type=small&time="+new Date().getTime();
            item.imagem = "https://graph.facebook.com/"+obj.id+"/picture?type=large&time="+new Date().getTime();
            item.url_img = "https://graph.facebook.com/"+obj.id+"/picture?type=large&time="+new Date().getTime();
            item.nome=obj.name;
            item.gender=obj.gender;
            item.status=1;
            item.email=obj.email;
            item.token = token;
            // console.log(item);
            Banco.salvar(item, "user_local", function(user){
              user.token_user = Uteis.make_token({id:user.objectId });

              if(device_token){
                Banco.getData("instalacoes", {token:device_token} , function(data){
                  if (data) {
                    data.key_usuario = user._id+"";
                    Banco.salvar(data, "intalacoes", function(re){
                      res.send(user);
                    });
                  }else{
                    res.send(user);
                  }
                });
              }else{
                res.send(user);
              }
            });
          });
        }
      })
    });

    // app.post('/v1/loginFacebook', function (req, res) {
    //   var token = req.body.fb_token;
    //   var device_token = req.body.device_token;
    //   var url = "https://graph.facebook.com/v2.5/me?fields=id,name,email,gender&access_token="+token;
    //   request(url, function (error, response, body) {
    //     if (!error && response.statusCode == 200) {
    //       var obj = JSON.parse(body);
    //
    //       // getUserApp(obj, function(item){
    //       Banco.getData("user_local", {id_facebook:obj.id+""} , function(item){
    //         // console.log(item);
    //         if(!item){
    //           item ={id_facebook:obj.id+""};
    //         }
    //         item.imagem_small = "https://graph.facebook.com/"+obj.id+"/picture?type=small&time="+new Date().getTime();
    //         item.imagem = "https://graph.facebook.com/"+obj.id+"/picture?type=large&time="+new Date().getTime();
    //         item.url_img = "https://graph.facebook.com/"+obj.id+"/picture?type=large&time="+new Date().getTime();
    //         item.nome=obj.name;
    //         item.gender=obj.gender;
    //         item.status=1;
    //         item.email=obj.email;
    //         item.token = token;
    //         console.log(item);
    //         Banco.salvar(item, "user_local", function(user){
    //           user.token_user = Uteis.make_token({id:user.objectId });
    //
    //           if(device_token){
    //             Banco.getData("intalacoes", {token:device_token} , function(data){
    //               if (data) {
    //                 data.key_usuario = user._id+"";
    //                 Banco.salvar(data, "intalacoes", function(re){
    //                   res.send(user);
    //                 });
    //               }else{
    //                 res.send(user);
    //               }
    //             });
    //           }else{
    //             res.send(user);
    //           }
    //         });
    //       });
    //     }
    //   })
    // });



    app.post('/loginCelular', function (req, res) {
      var senha = req.body.senha;
      var celular = req.body.celular;
      var nome = req.body.nome;
      // console.log(req.body);
      var device_token = req.body.device_token;

      function testToken(user){
        // console.log(user);
        if(device_token){
          Banco.getData("intalacoes", {token:device_token} , function(data){
            if (data) {
              data.key_usuario = user._id+"";
              Banco.salvar(data, "intalacoes", function(re){
                res.send(user);
              });
            }else{
              res.send(user);
            }
          });
        }else{
          res.send(user);
        }
      }

      // getUserApp(obj, function(item){
      Banco.getData("user_local", {celular:celular,senha:senha} , function(item){
        // console.log(item);
        if(!item && nome){
          item ={nome :nome, senha:senha, celular:celular};
          Banco.salvar(item, "user_local", function(user){
            user.token_user = Uteis.make_token({id:user._id+"" });
            user.login_celular = true;
            testToken(user);
          });
        }else if(item){
          item.login_celular = true;
          item.token_user = Uteis.make_token({id:item._id+"" });
          testToken(item);
        }else{
          res.send({error:"Usuário não econtrado..."});
        }
      });
    });


    app.post('/testarCelular', function (req, res) {
      var celular = req.body.celular;
      // getUserApp(obj, function(item){
      Banco.getData("user_local", {celular:celular} , function(item){
        // console.log(item);
        var codigo = random.integer(100000, 990000);
        var cel = Uteis.replaceAll(celular,"(","");
        cel = Uteis.replaceAll(cel," ","");
        cel = Uteis.replaceAll(cel,")","");
        cel = Uteis.replaceAll(cel,"-","");
        console.log("-"+cel+"-");
        console.log(codigo);
        if(item){
          // console.log(item);
          item.senha = codigo+"";
          Banco.salvar(item, "user_local", function(user){
            // console.log(user);
            enviarSMS("Verificação de celular senha: "+codigo, cel ,"loginUser",function (){
              res.send({error:true,msg:"Celular já cadastrado, enviamos a senha  por SMS para você..., isso pode levar alguns segundos"});
            });
          });

        }else{
          enviarSMS("Verificação de celular código: "+codigo, cel ,"loginUser",function (){
            res.send({codigo: codigo ,msg:"Enviamos um código  para você confirmar seu número  via SMS..., isso pode levar alguns segundos"});
          });
        }
      });
    });


  }

  enviarSMS(msg, numero,key_empresa,retorno){
    if( !numero || numero==""){
      retorno();
      return ;
    }
    Banco.salvar({ status:1, descricao:msg , key_empresa:key_empresa }, "sms", function(re){

      request.get({
        url: 'http://54.173.24.177/shortcode/api.ashx?action=sendsms&lgn=4988444343&pwd=684870&msg='+encodeURIComponent(msg)+'&numbers='+numero,
        method: 'GET',
      }, function (e, r, body) {
        console.log(body);
        retorno();
      });

    });
  }

}
