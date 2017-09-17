"use strict";
import restify from 'restify';
import Banco from "./api/banco";
import Uteis from "./api/uteis";

var http = require('http');
var path = require('path');
var im = require('imagemagick');
var fs  = require('fs');
var host = "localhost:7000";

export default class Files {

  constructor(app) {

    // server.post('/upload', function(request, response) {
    //     request.on('file', function() { // "end" doesn't work either, callback never called
    //         console.log(arguments);
    //     });
    // });
    //
    app.post( '/v1/file', function( req, res, next ) {
      // console.log(  req.files.file );
      host =  req.headers.host;

      if(req.files && req.files.file){
        var file = req.files.file;
        saveMoveCloud(file.path,  Uteis.path( file.name),function (url){
          console.log(url);
          res.send( {url : "http://"+host+url} );
        });
      }
    });

    app.post( '/v1/image', function( req, res, next ) {
      // console.log(  req.files.file );
      host =  req.headers.host;

      if(req.files && req.files.file){
        var file = req.files.file;
        saveMoveCloud(file.path,  Uteis.path( file.name),function (url){
          console.log(url);
          res.send( {url : "http://"+host+url} );
        });
      }
    } );

    app.post('/v1/imageMake', function (req, res) {

      var data = req.body;
      // console.log(data);
      if(!req.body.data){
        res.send({});
        return;
      }
      host =  req.headers.host;
      // console.log(host);
      var tipo = "jpg";
      if(Uteis.contemString(req.body.name,"png") || Uteis.startsWith(req.body.data,"data:image/png")){
        tipo = "png";
      }
      var buf = new Buffer(req.body.data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
      if(!req.body.name){
        req.body.name = req.body.nome;
      }
      var file_name =  Uteis.path(req.body.name);
      console.log(file_name);
      var lista = Object.keys(data);
      var result ={};
      // console.log();
      function loop(url,pos){
        console.log(url+" "+pos);
        if (pos< lista.length) {
          var tamanho = data[lista[pos]];
          // console.log(tamanho);
          if (tamanho.w) {
            var novo = "/files/f"+new Date().getTime()+"_"+tamanho.w+"_"+tamanho.h+"_"+file_name;
            im.resize({
              dstPath: '../assets'+novo,
              srcPath: "../assets"+result.original ,  width:   tamanho.w ,format: tipo
            }, function(err, stdout, stderr){
              if (err){
                res.send(result);
              } else{
                console.log(novo);
                pos++;
                result[tamanho.tipo]="http://"+host+novo;
                loop(url,pos);
              }
            });

          }else{
            pos++;
            loop(url,pos);
          }
        }else{
          console.log(result);
          res.send(result);
        }
      }

      saveFileCloud(buf,file_name,function (url){
        console.log(url);
        result.original = url;
        result.url_img="http://"+host+url;
        loop(url,0);
      });

    });


  }
}


function saveMoveCloud(path,fileName,retorno){
  console.log("sanvando..."+fileName);
  if(path){
    try {
      fs.existsSync("../assets") || fs.mkdirSync("../assets");
      fs.existsSync("../assets/files") || fs.mkdirSync("../assets/files");
    } catch (e) {
      console.log(e);
    }

    var name ="/files/f"+new Date().getTime()+"_"+fileName;
    var source = fs.createReadStream(path);
    var dest = fs.createWriteStream("../assets"+name);

    source.pipe(dest);
    source.on('end', function() {
      if(retorno){
        retorno(name);
      }
    });
    source.on('error', function(err) {
      console.log(err);
      retorno({error:"Sem path..."});
    });


  }else{
    if(retorno){
      retorno({error:"Sem path..."});
    }
  }
}

function saveFileCloud(buffer,fileName,retorno){
  console.log("sanvando..."+fileName);
  if(buffer){
    var name ="/files/f"+new Date().getTime()+"_"+fileName;
    var binaryData = buffer.toString('binary');

    try {
      fs.existsSync("../assets") || fs.mkdirSync("../assets");
      fs.existsSync("../assets/files") || fs.mkdirSync("../assets/files");
      // app.use(express.static( '../assets'));
    } catch (e) {
      console.log(e);
    }
    // var binaryData = new Buffer(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64').toString('binary');
    fs.writeFile("../assets"+name, binaryData, "binary", function (err) {
      console.log("salvou "+name);
      console.log(err); // writes out file without error, but it's not a valid image
      if(retorno){
        retorno(name);
        // retorno({url:name,local:"http://localhost:5000"+name});
      }
    });
  }else{
    if(retorno){
      retorno({error:"Sem buffer..."});
    }
  }
}
