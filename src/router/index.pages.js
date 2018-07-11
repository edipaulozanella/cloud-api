var request = require("request");
import uploadFiles from "../infra/upload_files";

export default class Router {
  constructor(server) {
    server.post("/v1/file", (req, res) => {
      uploadFiles.saveFile(req.files ? req.files.file : {}, (uri, error) => {
        if (error) {
          res.send(error);
        } else {
          res.send({
            url: "http://" + req.headers.host + uri
          });
        }
      });
    });

    server.post("/v1/image", (req, res) => {
      uploadFiles.saveFile(req.files ? req.files.file : {}, (uri, error) => {
        if (error) {
          res.send(error);
        } else {
          res.send({
            url: "http://" + req.headers.host + uri
          });
        }
      });
    });

    server.post("/v1/recortImage", (req, res) => {
      // console.log("send")
      uploadFiles.saveBase64(req.body.data, (uri, error) => {
        // console.log(uri)
        if (error) {
          res.send(error);
        } else {
          res.send({
            url: "http://" + req.headers.host + uri
          });
        }
      });
    });

 
  }
}
