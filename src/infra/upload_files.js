"use strict";
import Util from "./util";

var http = require('http');
var path = require('path');
var im = require('imagemagick');
var fs = require('fs');

exports.saveFile = function(file, callback) {
  console.log(file)
  if (!file || !file.data) return callback(null,{
    error: "not buffer"
  });
  try {
    var buffer = file.data;
    var fileName = file.name;

    var name = "/files/f" + new Date().getTime() + "_" + fileName;
    var binaryData = buffer.toString('binary');
    try {
      fs.existsSync("../assets") || fs.mkdirSync("../assets");
      fs.existsSync("../assets/files") || fs.mkdirSync("../assets/files");
    } catch (e) {}
    //save

    fs.writeFile("../assets" + name, binaryData, "binary", function(err) {
      if (err) console.log(err);
      if (callback) {
        callback(name);
      }
    });
  } catch (e) {
    console.log(e)
  }
}

exports.saveBase64 = function(base64, callback) {
  if (!base64) return callback(null,{
    error: "not buffer"
  });
  try {
    var tipo = "jpg";
    if (Util.contemString(base64, "data:image/png")) {
      tipo = "png";
    }
    var binaryData = new Buffer(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64').toString('binary');
    var fileName = "img." + tipo;
    var name = "/files/f" + new Date().getTime() + "_" + fileName;
    try {
      fs.existsSync("../assets") || fs.mkdirSync("../assets");
      fs.existsSync("../assets/files") || fs.mkdirSync("../assets/files");
    } catch (e) {}
    //save
    fs.writeFile("../assets" + name, binaryData, "binary", function(err) {
      if (err) console.log(err);
      if (callback) {
        callback(name,err);
      }
    });
  } catch (e) {
    console.log(e)
  }
}
