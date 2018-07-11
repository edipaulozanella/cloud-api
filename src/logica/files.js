const AWS = require("aws-sdk");
import Util from "../infra/util";
var randomstring = require("randomstring");  
 
const spacesEndpoint = new AWS.Endpoint("nyc3.digitaloceanspaces.com");
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: "uu",
  secretAccessKey: "dFrD8jDGppX+uu+hE"
});
var bucket = "ii";
var url = "https://"+bucket+".nyc3.digitaloceanspaces.com/";
// Add a file to a Space

export function uploadBase64(base64, callback) {
  if (!base64) return callback(null, { error: "not buffer" });
  try {
    var tipo = "jpg";
    if (Util.contemString(base64, "data:image/png")) tipo = "png";

    var buf = new Buffer(base64.replace(/^data:image\/\w+;base64,/, ""), "base64");
    var fileName = "fotos/"+ randomstring.generate()+ "." + tipo;
    // console.log(spacesEndpoint, url);
    var data = {
      Key: fileName,
      Body: buf,
      Bucket: bucket,
      ACL: "public-read",
      ContentType: tipo == "jpg" ? "image/jpeg" : "image/png"
    };
    s3.putObject(data, function(err, data) {
        // console.log(err,data) 
      if (err) {
        if (callback) callback(null, err);
      } else {
        if (callback) callback(url + fileName, err);
      }
    });
  } catch (e) {
    console.log(e);
  }
}
