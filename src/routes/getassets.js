const express = require("express");
var archiver = require('archiver');

const textureData = require('../boxcritters/genasset');
const imageDataURI = require("image-data-uri");
const request = require("request");

var router = express.Router();

/**
 * Routers
 */

router.get('/', async (req, res) => {
	var zip = archiver('zip', {
		zlib: { level: 9 } // Sets the compression level.
	});
	var urlInfo = await textureData.GetTextureList();
	delete urlInfo.name;
	delete urlInfo.author;
	delete urlInfo.date;
	delete urlInfo.description;
	delete urlInfo.packVersion;
	var urls = Object.values(urlInfo);

	// good practice to catch warnings (ie stat failures and other non-blocking errors)
	zip.on('warning', function (err) {
		if (err.code === 'ENOENT') {
			// log warning
			res.status(500).send({warning: err.message});
		} else {
			// throw error
			res.status(500).send({error: err.message});
			throw err;
		}
	});

	// good practice to catch this error explicitly
	zip.on('error', function (err) {
		res.status(500).send({error: err.message});
	});

	//on stream closed we can end the request
	zip.on('end', function() {
	  console.log('Archive wrote %d bytes', zip.pointer());
	});
	
	res.attachment('boxcritters.zip');
	zip.pipe(res);
	console.log(urls);
	

	for (var i=0; i < urls.length; i++) {
		let url = urls[i];

		zip.append(request(url),{name:url})
	}
	zip.finalize();

})


module.exports = router;