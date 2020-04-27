const express = require("express");
const textureData = require('../boxcritters/genasset');
const request = require("request");
var CombinedStream = require('combined-stream');

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


		var toSend = CombinedStream.create();

		/*var clientStream = request(clientScriptURL);
		var modStream = request(url);*/

		/*clientStream.pipe(toSend,{end:false});
		modStream.pipe(toSend,{end:false});*/
		toSend.append(request(clientScriptURL));
		toSend.append(request(url));
		toSend.pipe(res);
	} catch (e) {
		console.log(e);

		res.send("Error: " + e);
		return;
	}
});

module.exports = router;