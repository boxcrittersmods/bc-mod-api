"use strict";
const express = require("express");
const { displayGear } = require("#src/boxcritters/displayGear");




let router = express.Router();

router.use(express.json());

router.get('/:critterId', async function (req, res) {
	let fileParts = req.params.critterId.split(".");
	let critterId = fileParts[0];
	let gear = Object.keys(req.query);
	let imgBuffer = await displayGear({ critterId, gear });

	res.type("." + fileParts[fileParts.length - 1]);
	res.send(imgBuffer);
});

module.exports = router;