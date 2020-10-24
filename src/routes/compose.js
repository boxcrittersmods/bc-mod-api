"use strict";
const express = require("express");
const Jimp = require('jimp');

let router = express.Router();

router.use(express.json());

router.get('/', async function (req, res) {
	let images = req.body;
	if (!Array.isArray(images) || images.length < 1) {
		res.send("No Images where sent");
		return;
	}
	images = await Promise.all(images.map(i => Jimp.read(i)));
	let image = images.shift();
	for (let i = 0; i < images.length; i++) {
		image.composite(images[i], 0, 0);

	}
	let imgBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

	res.type('image/png');
	res.send(imgBuffer);
});

module.exports = router;