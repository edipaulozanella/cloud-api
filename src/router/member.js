var request = require("request");
import * as Member from "../logica/member";
import * as Util from "../infra/util";

export default class Router {
  constructor(server) {

    server.get("/v1/member", (req, res) => {
      var data = req.body;
    //   var user = Util.getUserFromToken(req);
    //   if (user) {
        Member.listar( (data, error) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.send(data);
          }
        });
    //   } else {
    //     res.status(500).send({ msg: "sem token" });
    //   }
    });
    
    server.put("/v1/member", (req, res) => {
      var data = req.body;
      var user = Util.getUserFromToken(req);
      if (user) {
        Member.alterar(data, user.id, (data, error) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.send(data);
          }
        });
      } else {
        res.status(500).send({ msg: "sem token" });
      }
    }); 
 
    server.post("/v1/member", (req, res) => {
      var data = req.body;
    //   var user = Util.getUserFromToken(req);
    //   if (user) {
        var user ={id:1}
        Member.criar(data, user.id, (data, error) => {
          if (error) {
            res.status(500).send(error);
          } else {
            res.send(data);
          }
        });
    //   } else {
    //     res.status(500).send({ msg: "sem token" });
    //   }
    });

 
  }
}
