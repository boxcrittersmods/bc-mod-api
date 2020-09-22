const express = require("express");
const Jimp = require('jimp');

var router = express.Router();

router.use(express.json())

router.get('/',async function(req,res){
	var images = req.body;
	if(!Array.isArray(images)){
		res.send("No Images where sent");
		return;
	}
	var images = await Promise.all(images.map(i=>Jimp.read(i)));
	var image = images.shift();
	for (let i = 0; i < images.length; i++) {
		image.composite(images[i],0,0)
		
	}
	var imgBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

	res.type('image/png');
	res.send(imgBuffer);
})

module.exports = router;