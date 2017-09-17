"use strict";
import restify from "restify";
import Banco from "./api/banco";;
var moment = require("moment");

var PushNotification = require("./api/notification");

export default class Logica {

	save(pos, list) {
		if (pos < list.length) {
			let item = list[pos];
			Banco.getData("temperatura", {
				time: item.time,
				ssid: item.ssid
			}, (data) => {
				if (!data) {
					console.log(item.time,data)
					Banco.salvar(item, "temperatura", (re)=> {
						pos++;
						this.save(pos, list);
					});
				}
			})
		}
	}


	constructor(app) {
		app.post("/v1/metodo", function(req, res) {
			console.log(req.body);
		});

		app.post("/v1/saveTemperatura", (req, res) => {
			// console.log(req.body)
			if (req.body) {
				var list = req.body;
				console.log("temperatura " + list.length);
				for (var i = 0; i < list.length; i++) {
					let item = list[i];
					delete item._id;
					if (item.data) {
						let t = item.data;
						t.hour = t.hour >= 10 ? t.hour : "0" + t.hour;
						t.minute = t.minute >= 10 ? t.minute : "0" + t.minute;
						t.month = t.month >= 10 ? t.month : "0" + t.month;
						t.day = t.day >= 10 ? t.day : "0" + t.hour;
						item.time = "20" + t.year + "-" + t.month + "-" + t.day + "T" + t.hour + ":" + t.minute + ":10.249Z";
					}
				}
			}
			this.save(0, list);
			res.send({
				OK: true
			});
		});

		app.post("/v1/saveAbertura", function(req, res) {
			if (req.body) {
				var list = req.body;
				console.log("aberturas " + list.length);
				for (var i = 0; i < list.length; i++) {
					let item = list[i];
					delete item._id;
					// console.log(item);
					if (item.data) {
						let t = item.data;
						t.hour = t.hour >= 10 ? t.hour : "0" + t.hour;
						t.minute = t.minute >= 10 ? t.minute : "0" + t.minute;
						t.month = t.month >= 10 ? t.month : "0" + t.month;
						t.day = t.day >= 10 ? t.day : "0" + t.hour;
						item.time = "20" + t.year + "-" + t.month + "-" + t.day + "T" + t.hour + ":" + t.minute + ":10.249Z";
						// console.log(item)

						Banco.getData("atertura", {
							time: item.time,
							ssid: item.ssid
						}, (data) => {
							if (!data) {
								Banco.salvar(item, "atertura", function(re) {});
							}
						})

					}

				}
			}
			res.send({
				OK: true
			});
		});
	}
}