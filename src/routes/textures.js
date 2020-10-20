"use strict"
const express = require("express");
let archiver = require('archiver');

const textureData = require('../boxcritters/genasset');
const request = require("request");

let router = express.Router();

/**
 * Routers
 */

 
// /getassets
router.get('/download',async (req,res)=>{
	let zip = archiver('zip', {
		zlib: { level: 9 } // Sets the compression level.
	});
	let urlInfo = await textureData.GetTextureList();
	let urls = Object.values(urlInfo);

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
	  console.debug('Archive wrote %d bytes', zip.pointer());
	});

	let date = new Date()
let dateNum = date.getDate()+(date.getMonth()*100)+((date.getFullYear()-2000)*10000)
	let name = "boxcritters-" + dateNum + ".zip"
	res.attachment(name);
	zip.pipe(res);
	console.debug(urls);
	

	for (let i=0; i < urls.length; i++) {
		let url = urls[i];

		console.debug(url);
		zip.append(request(url),{name:url})
	}
	zip.finalize();

})


// /textures
router.get('/BoxCritters.bctp.json',async (req,res)=>{
	res.type("application/json");
	let textures = await textureData.GetTextureList();
	textures = Object.assign({
		"name": "BoxCritters",
		"author": "RocketSnail",
		"date": 1564832528955,
		"description": "This is the classical look of Box Critters"
	  },textures);
    res.json(textures);

})


router.get('/:type/:name/view',async (req,res)=>{
	//res.type("plain/text");
	let textures = await textureData.GetTextureList(req.params.type);
    res.redirect(textures[req.params.name]);

});
router.get('/:type/:name',async (req,res)=>{
	//res.type("plain/text");
	let textures = await textureData.GetTextureList(req.params.type);
    res.send(textures[req.params.name]);

});
router.get('/:type',async (req,res)=>{
	//res.type("plain/text");
	res.type("application/json");
    let textures = await textureData.GetTextureData();
    res.json(textures[req.params.type]);

});

 // /texture-data
router.get('/',async (req,res)=>{
	res.type("application/json");
    let textures = await textureData.GetTextureData();
    res.json(textures);

})




module.exports = router;
