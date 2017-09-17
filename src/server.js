"use strict";
import restify from 'restify';
import Banco from "./api/banco";
import ApiV1 from "./v1";
import Files from "./v1_files";
import Msgs from "./v1_msg";
import Login from "./v1_login";
import Logica from "./v1_logica";
import Uteis from "./api/uteis";

var Projeto = require("../projeto.json");

var PushNotification = require('./api/notification');

Banco.setDatabase(Projeto.path);
PushNotification.setKeyServerGoogle(Projeto.key_google_server);

var fs  = require('fs');
var os = require( 'os' );
var serveStatic = require('serve-static-restify')

class Server {

  testarToken(req){
    return true;
    // console.log(req.headers);
    // if(req.headers && req.headers.token_api && tokens[req.headers.token_api]){
    //   return true;
    // }else if (req.headers && req.headers['x-request-id'] && tokens[req.headers['x-request-id']]){//req.headers.accept
    //   return true;
    // }else{
    //   return false;
    // }
  }

  constructor() {
    let port = Projeto.porta ? Number( Projeto.porta) : 7000;
    this.server = restify.createServer();
    this.server.use(restify.authorizationParser());

    this.server.use(restify.fullResponse()).use(restify.bodyParser({
      maxBodySize: 1000 * 1024*100,
      mapParms: true,
      mapFiles: true,
      keepExtensions: true,
      uploadDir: os.tmpdir()
    }));

    this.server.use(  (req,res,next)=>{
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
      // res.header('Access-Control-Allow-Headers', req.header("Access-Control-Request-Headers"));
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      // res.header('Access-Control-Allow-Credentials', true);
      // console.log(req.headers);
      // console.log("passou token:",req.url + " "+req.headers.accept);
      if(Uteis.contemString(req.url,"/v1/")){
        if(this.testarToken(req)){
          return next();
        }else{
          console.log("error token:",req.url);
          next(new restify.NotAuthorizedError("Token não reconhecido: {token_api}"));
        }
      }else{
        return next();
      }
    });

    this.server.pre(serveStatic( './public'))
    // this.server.pre(serveStatic( '../assets'))


    new ApiV1(this.server);
    new Files(this.server);
    new Msgs(this.server);
    new Login(this.server);
    new Logica(this.server);

    this.server.post('/v1/projeto', function (req, res) {
      var request = require('request');
      var options = { url: 'http://web.1app.com.br/v1/projeto/'+Projeto.objectId, method: 'POST', headers: {  'content-type': 'application/json'  } };
      request.post(options, function (e, r, body) {
        if (!e) {
          var pro = JSON.parse(body);
          res.send(pro);
        }else{
          console.log(e);
          res.send(Projeto);
        }
      });
    });

    this.server.get('/files/:name', function (req, res) {
      //  var name = req.params.name;
       fs.readFile("../assets/files/"+req.params.name,  function(err, data) {
         res.write(data);
         res.end();
       });
    });

    this.server.listen(port, (err) => {  if (err){console.error(err);}else{ console.log('App is ready at : ' + port)}; });
    if (process.env.environment == 'production') {
      process.on('uncaughtException', (err) => {console.error(JSON.parse(JSON.stringify(err, ['stack', 'message', 'inner'], 2)))} );
    }
  }
}
new Server();
