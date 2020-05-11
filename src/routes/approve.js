const express = require("express");
const request = require("request");
const gniddom = require("../util/github");

var router = express.Router();

router.use("/", (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.set("Content-Type", "application/json");
	next();
});

router.use("/", bodyParser.text());

var token = "myInsecureTokenPleaseChangeMe-0123_blah.abc";

/**
 * Paths
 **/

/* /modapprove/(token)/(base64_url) */
router.use(`/approve/${process.env.SUBMIT_TOKEN}/:url`, async function (req, res) {
	console.log(req.params.url);
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

module.exports = router;
