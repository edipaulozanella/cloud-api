var request = require("request");

export default class Router {
	constructor(server) {

		server.get("/", (req, res) => {
			res.send("Hello World Index");
		});

		server.get("/home", (req, res) => {
			res.send("Hello World Index");
		});

	}

}