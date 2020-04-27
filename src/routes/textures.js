const express = require("express");
var archiver = require('archiver');

const textureData = require('../boxcritters/genasset');
const request = require("request");

var router = express.Router();

/**
 * Routers
 */

 
// /getassets
router.get('/download',async (req,res)=>{
	var zip = archiver('zip', {
		zlib: { level: 9 } // Sets the compression level.
	});
	var urlInfo = await textureData.GetTextureList();
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

		console.log(url);
		zip.append(request(url),{name:url})
	}
	zip.finalize();

})


// /textures
router.get('/BoxCritters.bctp.json',async (req,res)=>{
	res.type("application/json");
	var textures = await textureData.GetTextureList();
	textures = Object.assign(textures,{
		"name": "BoxCritters",
		"author": "RocketSnail",
		"date": 1564832528955,
		"description": "This is the classical look of Box Critters"
	  });
    res.json(textures);

})


router.get('/:name/view',async (req,res)=>{
	//res.type("plain/text");
	var textures = await textureData.GetTextureList();
    res.redirect(textures[req.params.name]);

});
router.get('/:name',async (req,res)=>{
	//res.type("plain/text");
	var textures = await textureData.GetTextureList();
    res.send(textures[req.params.name]);

});

 // /texture-data
router.get('/',async (req,res)=>{
	res.type("application/json");
    var textures = await textureData.GetTextureData();
    res.json(textures);

})




module.exports = router;