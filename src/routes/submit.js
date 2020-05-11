const express = require("express");
const cors = require("cors");
const request = require("request");
const bodyParser = require("body-parser");
const gniddom = require("../util/github");

var router = express.Router();

router.use("/", (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.type("application/json");
	next();
});

router.use("/", bodyParser.text());

var token = "myInsecureTokenPleaseChangeMe-0123_blah.abc";

/**
 * Paths
 **/

/* /submit/approve/(token)/(base64_url) */
router.use(`/approve/${process.env.SUBMIT_TOKEN || token}/:url`, async function (req, res) {
	var url = new Buffer.from(req.params.url, "base64").toString("ascii");
	request({
		"url": url
	}, async function (sub_err, sub_res, sub_body) {
		if (sub_err)
		{
			res.send(`Error: ${sub_err}.`);
			return;
		}
		await gniddom.createMod(sub_body, url);
		res.send("{\"ok\": \"ok\"}");
	});
});

/* /submit/(url) */
router.use("/:url", function (req, res) {
	console.log(req.path);
	request({
		"url": "http://" + req.path.substr(1)
	}, function (sub_err, sub_res, sub_body) {
		if (sub_err)
		{
			res.send(`Error: ${sub_err}.`);
			return;
		}
		var version = sub_body.match(/\/\/\s*@version\s+(.*)\s*\n/i);
		var name = sub_body.match(/\/\/\s*@name\s+(.*)\s*\n/i);
		var description = sub_body.match(/\/\/\s*@description\s+(.*)\s*\n/i);
		var author = sub_body.match(/\/\/\s*@author\s+(.*)\s*\n/i);
		var icon = sub_body.match(/\/\/\s*@icon\s+(.*)\s*\n/i);
		var approve = `https://api.boxcrittersmods.ga/submit/approve/${process.env.SUBMIT_TOKEN || token}/${new Buffer.from("http://" + req.path.substr(1)).toString("base64")}`;

		if (version && name && description && author)
		{
			request.post({
				"url": process.env.SUBMIT_WEBHOOK,
				"headers": {
					"Content-Type": "application/json"
				},
				"body": `{
							"username": "Gniddom",
							"icon_url": "https://cdn.discordapp.com/avatars/588066376590163974/644f5bf51ee6777d6fe7351ce497610e.png?size=128",
							"attachments": [
								{
									"author_name": "${author[1]}",
									"title": "${name[1]}",
									"title_link": "${"http://" + req.path.substr(1)}",
									"text": "${description[1]}",
									"color": "#ffaa00",
									"fields": [
										{
											"value": "**[✅](${approve})**",
											"inline": true
										}
									]
								}
							]
						}`
			});
		}
		res.send("{\"ok\": \"ok\"}");
	});
});

module.exports = router;
