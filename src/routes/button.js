const express = require("express");
const request = require("request");

var router = express.Router();

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
				res.send(`Error: ${sub_err}.`);
				return;
			}
			res.set("Content-Type", "image/svg+xml");
			var version = sub_body.match(/\/\/\s*@version\s+(.*)\s*\n/i);
			if (version)
			{
				request({
					"url": `https://img.shields.io/badge/BCMC_Published!-v${version[1]}-10ca90`
				}, function (sub_err, sub_res, sub_body) {
					if (sub_err)
					{
						res.send(`Error: ${sub_err}.`);
						return;
					}
					res.send(sub_body);
				});
			}
		});
	} catch (e) {
		console.log(e);
		res.send("Error: " + e);
		return;
	}
}

/**
 * Paths
 **/

/* /button/(userscript_url || mod_name) */
router.use("/:url_or_name", async (req, res) => {
	try {
		var settings = Object();
		if (req.params.url_or_name == "http:" || req.params.url_or_name == "https:")
		{
			send_response({
				"url": req.params.url_or_name + "//" + req.path.substr(1) + ".user.js"
			}, res);
		} else
		{
			var url;
			request({
				"url": "https://raw.githubusercontent.com/boxcritters/boxcrittersmods.ga/master/_mods/" + req.params.url_or_name + ".md"
			}, function (sub_err, sub_res, sub_body) {
				if (sub_err)
				{
					res.send(`Error: ${sub_err}.`);
					return;
				}
				var userscript = sub_body.match(/userscript:\s*(.*)/i);
				if (userscript && userscript[1] == "true")
				{
					var install = sub_body.match(/install:\s*(.*)/i);
					if (install)
					{
						send_response({
							"url": install[1]
						}, res);
					}
				} else
				{
					res.send("The mod is not a user script mod.");
					return;
				}
			});
		}
	} catch (e) {
		console.log(e);
		res.send("Error: " + e);
		return;
	}
});

module.exports = router;
