const express = require("express");
const cors = require("cors");
const request = require("request");

var router = express.Router();

router.use("/", (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.set("Content-Type", "application/json");
	next();
});

var token = "myInsecureTokenPleaseChangeMe-0123_blah.abc";

/**
 * Paths
 **/

/* /modsubmit/(base64_url) */
router.use("/:base64_url", function (req, res) {
	console.log(req.path);
	request({
		"url": new Buffer.from(req.params.base64_url, "base64").toString("ascii")
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
		var approve = `https://api.boxcrittersmods.ga/modapprove/${process.env.SUBMIT_TOKEN}/${req.params.base64_url}`;

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
									"title_link": "${new Buffer.from(req.params.base64_url, "base64").toString("ascii")}",
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
