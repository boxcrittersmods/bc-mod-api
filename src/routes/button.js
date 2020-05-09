const express = require("express");
const cors = require("cors");
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
				res.set("Content-Type", "image/svg+xml");
				var version = sub_body.match(/\/\/\s*@version\s+(.*)\s*\n/i)[1];
				res.send(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${90 + 10 * (0.75 * (version.length + 1))}" height="20">
							<linearGradient id="s" x2="0" y2="100%">
								<stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
								<stop offset="1" stop-opacity=".1"/>
							</linearGradient>
							<clipPath id="r">
								<rect width="${90 + 10 * (0.75 * (version.length + 1))}" height="20" rx="3" fill="#fff"/>
							</clipPath>
							<g clip-path="url(#r)">
								<rect width="${90 + 10 * (0.75 * (version.length + 1))}" height="20" fill="#555"/>
								<rect x="90" width="${10 * (0.75 * (version.length + 1))}" height="20" fill="#10ca90"/>
								<rect width="90" height="20" fill="url(#s)"/>
							</g>
							<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
								<text x="460" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="825">BCMC Published!</text>
								<text x="460" y="140" transform="scale(.1)" textLength="825">BCMC Published!</text>
								<text x="${1024 + 10 * (1.5 * (version.length + 1))}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(version.length + 1) * 58}">${"v" + version}</text>
								<text x="${1024 + 10 * (1.5 * (version.length + 1))}" y="140" transform="scale(.1)" textLength="${(version.length + 1) * 58}">${"v" + version}</text>
							</g>
						</svg>`);
				
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
				if (sub_body.match(/userscript:\s*(.*)\n/i)[1] == "true")
				{
					url = sub_body.match(/install:\s*(.*)\n/i)[1];
					send_response({
						"url": url
					}, res);
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
