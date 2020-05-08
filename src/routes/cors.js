const express = require("express");
const cors = require("cors");
const request = require("request");
const absolutify = require("absolutify");
const imageDataURI = require("image-data-uri");

var router = express.Router();

function getHostName(url) {
	var nohttp = url.replace("http://", "").replace("https://", "");
	var http = url.replace(nohttp, "");
	var hostname = http + nohttp.split(/[/?#]/)[0];
	return hostname;
}

router.use("/", (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

/**
 * Paths
 */

// /cors/data/(url)
router.use("/data", async (req, res) => {
	var url = req.path.substr(1);
	console.log("URL:", url);
	if (!url) {
		res.send("No URL provided");
		return;
	}
	try {
		imageDataURI.encodeFromURL(url).then(data => {
			res.json({ url: data });
		});
	} catch (e) {
		console.log(e);

		res.send("Error: " + e);
		return;
	}
});

// /cors/file/(url)
router.use("/file", async (req, res) => {
	var url = req.path.substr(1);
	console.log("URL:", url);
	if (!url) {
		res.send("No URL provided");
		return;
	}
	request(url).pipe(res)
});

// /cors/(url)
router.use("/", async (req, res) => {
	var url = req.path.substr(1);
	console.log("URL:", url);
	if (!url) {
		res.send("No URL provided");
		return;
	}
	try {
		var document = "";
		var i = 0;

		var settings = {
			url: url,
			encoding: null
		};

		request(settings, function (sub_err, sub_res, sub_body) {
			var i = 0;
			var document = sub_body;
			while (i < sub_res.rawHeaders.length)
			{
				res.set(sub_res.rawHeaders[i], sub_res.rawHeaders[i + 1]);
				i += 2;
			}
			if (sub_res.caseless.dict["content-type"] == "text/html")
			{
				document = absolutify(sub_body, `/cors/${getHostName(url)}`);
			}
			res.send(document);
		});
	} catch (e) {
		console.log(e);

		res.send("Error: " + e);
		return;
	}
});

module.exports = router;
