const express = require("express");
const cors = require("cors");
const request = require("request");

const app = express();

app.get("/", function (req, res) {
	request.post({
		"url": "https://github.com/login/oauth/access_token",
		"headers": {
			"Accept": "application/json"
		},
		"form": {
			"client_id": process.env.SDK_ID || "0e2f0998eb2d876ade77",
			"client_secret": process.env.SDK_SECRET || "b4a7a32b6193c056429f5a2305197603d870123c",
			"code": req.query.code
		}
	}, function (sub_err, sub_res, sub_body) {
		if (sub_err)
		{
			res.send(`Error: ${sub_err}.`);
			return;
		}
		var token = JSON.parse(sub_body).access_token;
		console.log(JSON.parse(sub_body));
		request.get({
			"url": "https://api.github.com/gists",
			"headers": {
				"Accept": "application/json",
				"User-Agent": "CritterSDK",
				"Authorization": `token ${token}`
			}
		},  function (sub_err, sub_res, sub_body) {
			if (sub_err)
			{
				res.send(`Error: ${sub_err}.`);
				return;
			}
			var gists = JSON.parse(sub_body);
			console.log(sub_body);
			/*gists.forEach(function (gist) {
				console.log(gist.id);
			});*/
			res.send(sub_body);
		});
	});
});

app.listen(3000);
