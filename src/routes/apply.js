const express = require("express");
const genasset = require("../boxcritters/genasset");
const request = require("request");
const combinedstream = require("combined-stream");

var router = express.Router();

router.use("/", (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.type("application/javascript");
	next();
});

/* /applymods/(base64_urls[]) */
router.use("/:base64_urls", async function (req, res) {
	var urls = JSON.parse(Buffer.from(req.params.base64_urls, "base64").toString("ascii"));
	try
	{
		var client = combinedstream.create();
		request({
			"url": genasset.GetClientScript()
		}, function (sub_err, sub_res, sub_body) {
			if (sub_err)
			{
				res.set("Content-Type", "application/json");
				res.type("application/json");
				res.status(503).send(`{"err": "${sub_err}"`);
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
		res.set("Content-Type", "application/json");
		res.type("application/json");
		res.status(500).send(`{"err": "${rr}"`);
		return;
	}
});

module.exports = router;
