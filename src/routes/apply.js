const express = require("express");
const genasset = require("../boxcritters/genasset");
const request = require("request");
const combinedstream = require("combined-stream");

var router = express.Router();

router.use("/", (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.type(".js");
	next();
});

// /applymods/(base64_urls[])
router.use("/:base64_urls", async function (req, res) {
	var urls = JSON.parse(Buffer.from(req.params.base64_urls, "base64").toString("ascii"));
	try
	{
		var client = combinedstream.create();
		request({
			"url": await genasset.GetClientScript()
		}, function (sub_err, sub_res, sub_body) {
			if (sub_err)
			{
				res.send(`Error: ${sub_err}.`);
				return;
			}
			client.append(sub_body);
			if (urls)
			{
				urls.forEach(function (url) {
					client.append(request(url));
				});
			}
			client.pipe(res);
		});
	} catch (err)
	{
		console.log(err);
		res.send(`Error: ${err}`);
		return;
	}
});

module.exports = router;
