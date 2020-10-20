"use strict"
const express = require("express");
const request = require("request");

let router = express.Router();

router.use("/", (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

function send_response(settings, res)
{
	try {
		request(settings, function (sub_err, sub_res, sub_body) {
			if (sub_err)
			{
				res.set("Content-Type", "application/json");
				res.type("application/json");
				res.status(503).send(`{"err": "${sub_err}"`);
				return;
			}
			res.set("Content-Type", "image/svg+xml");
			res.type("image/svg+xml");
			let version = sub_body.match(/\/\/\s*@version\s+(.*)\s*\n/i);
			if (version)
			{
				request({
					"url": `https://img.shields.io/badge/BCMC_Published!-v${version[1]}-10ca90`
				}, function (sub_err, sub_res, sub_body) {
					if (sub_err)
					{
						res.set("Content-Type", "application/json");
						res.type("application/json");
						res.status(503).send(`{"err": "${sub_err}"`);
						return;
					}
					res.send(sub_body);
				});
			}
		});
	} catch (err) {
		console.debug(err);
		res.set("Content-Type", "application/json");
		res.type("application/json");
		res.status(500).send(`{"err": "${sub_err}"`);
		return;
	}
}

/**
 * Paths
 **/

/* /button/(userscript_url || mod_name) */
router.use("/:url_or_name", async (req, res) => {
	try {
		let settings = Object();
		if (req.params.url_or_name == "http:" || req.params.url_or_name == "https:")
		{
			send_response({
				"url": req.params.url_or_name + "//" + req.path.substr(1) + ".user.js"
			}, res);
		} else
		{
			let url;
			request({
				"url": "https://raw.githubusercontent.com/boxcritters/boxcrittersmods.ga/master/_mods/" + req.params.url_or_name + ".md"
			}, function (sub_err, sub_res, sub_body) {
				/* console.debug(sub_body); */
				if (sub_err)
				{
					res.set("Content-Type", "application/json");
					res.type("application/json");
					res.status(503).send(`{"err": "${sub_err}"`);
					return;
				}
				let userscript = sub_body.match(/userscript:\s*(.*)/i);
				if (userscript && userscript[1] == "true")
				{
					let install = sub_body.match(/\s*buttons:\s*\n\s*-\s*name:\s*Install\n\s*href:\s*(.*)/i);
					if (install)
					{
						send_response({
							"url": install[1]
						}, res);
					}
				} else
				{
					res.set("Content-Type", "application/json");
					res.type("application/json");
					res.status(503).send(`{"err": "The mod is not a user script mod."`);
					return;
				}
			});
		}
	} catch (err) {
		console.debug(err);
		res.set("Content-Type", "application/json");
		res.type("application/json");
		res.status(500).send(`{"err": "${err}"`);
		return;
	}
});

module.exports = router;
