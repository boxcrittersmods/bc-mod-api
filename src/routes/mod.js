const express = require("express");
const textureData = require('../boxcritters/genasset');
const request = require("request");
const stream = require('stream');

var router = express.Router();


router.use("/", (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.type('.js');
	next();
});



// /mod/(url)
router.use("/", async (req, res) => {
	var url = req.path.substr(1);
	console.log("URL:", url);
	if (!url) {
		res.send("No URL provided");
		return;
	}
	try {
		var clientScriptInfo = textureData.GetClientScript();
		var clientScriptURL = textureData.getTextureURL(clientScriptInfo);
		console.log("clientURL:", clientScriptURL);
		var toSend = new stream.PassThrough();

		request(clientScriptURL).pipe(toSend,{end:false});
		request(url).pipe(toSend,{end:false});
		toSend.pipe(res);
	} catch (e) {
		console.log(e);

		res.send("Error: " + e);
		return;
	}
});

module.exports = router;