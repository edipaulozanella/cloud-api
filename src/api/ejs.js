var ejs = require('ejs')
var fs  = require('fs');

// var people = ['geddy', 'neil', 'alex']
// var templateString = fs.readFileSync("./src/views/test.ejs", 'utf-8');
// var html = ejs.render(templateString, {people: people});
// console.log(html);

exports.render = function (res, path , data,files) {
  var templateString ="";
  data = data ? data : {};
  try {
    templateString = fs.readFileSync(path , 'utf-8');
  //console.log(templateString);
  } catch (e) {
    console.log(e);
  }
  var html = ejs.render(templateString, data,{filename:path});
  // return html;
  res.write(html);
  res.end();
};

exports.make = function ( path , data,files) {
  var templateString ="";
  data = data ? data : {};
  try {
    templateString = fs.readFileSync(path , 'utf-8');
  //console.log(templateString);
  } catch (e) {
    console.log(e);
  }
  var html = ejs.render(templateString, data,{filename:path});
  // return html;
  return html;
};

	// import ejs from "./api/ejs.js";
    // this.server.get('/test', function (req, res) {
    //   ejs.render(res,"./src/views/test.ejs",{people: ["Edi"]})
    // });
