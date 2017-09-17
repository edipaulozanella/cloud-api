var gcm = require('node-gcm');
var Device = require('apnagent').Device;
//var join = require('path').join, pfx = join(__dirname, '../../developer.p12');
 var join = require('path').join, pfx = join(__dirname, '../../production.p12');
var apnagent = require('apnagent');
var agent =  new apnagent.Agent();
agent.set('pfx file', pfx);
//
agent.enable('sandbox');
// agent.enable('production');
var keyServerGoogle = 'AIzaSyDl2YO_RgunLXBntnSzG-Eott0wvLXW_1M';
exports.setKeyServerGoogle = function (key) {
  keyServerGoogle = key;
}

exports.enviarNotificacao = function(not,lista,retorno){
  // console.log("edi ...");
  if(!lista || lista.length == 0){
    retorno();
    return;
  }
  var lista_android = [];// limit 1000
  var lista_ios = [];
  for (var i = 0; i < lista.length; i++) {
    var item=  lista[i];
    console.log(item.token);
    if(item.os=="android"){
      lista_android.push(item.token);
    }
    if(item.os=="ios"){
      lista_ios.push(item.token);
    }
  }
  // console.log("Enviar");
  // console.log(lista);
  // console.log(lista_android);
  setnApple(not,lista_ios,function(re){
    sendGoogle(not,lista_android,function(re){
      retorno();
    });
  });

};
//
// our credentials were for development
agent.connect(function (err) {
  if (err && err.name === 'GatewayAuthorizationError') {
    console.log('Authentication Error: %s', err.message);
  }else if (err) {
    throw err;
  }
});
agent.on('message:error', function (err, msg) {
  console.log(err);
  agent.connect();
});

function bufferize (token) {
  return new Buffer(token.replace(/[^a-z0-9]/gi, ''), 'hex');
}

function setnApple(not,reqTokens,retorno){
  if(!reqTokens || reqTokens.length ==0){
    retorno();
    return;
  }
  console.log("mandarIOS");
  for (var i = 0; i < reqTokens.length; i++) {
    var token=  reqTokens[i];
    console.log(token);
    // var device = new Device(token);
    var device = new Device(bufferize(token));
    agent.createMessage().device(device).set('dest', JSON.stringify(not.dest)).alert(not.alert).badge(1).send();
  }
  var env = agent.enabled('sandbox')  ? 'sandbox' : 'production';
  console.log('mandou = [%s] '+reqTokens.length, env);

  setTimeout(function(){
    retorno();
  }, 1000);

}

function sendGoogle(not,regTokens,retorno){
  var message = new gcm.Message();
  message.addData('data', not);
  message.addNotification('alert', not.alert);
  var sender = new gcm.Sender(keyServerGoogle);
  sender.send(message, regTokens, function (err, response) {
    if(err) {
      console.error(err);
      retorno(err);
    } else {
      console.log(response);
      retorno(response);
    }
  });
}
