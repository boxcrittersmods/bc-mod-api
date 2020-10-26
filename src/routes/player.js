"use strict";
const express = require("express");
const Website = require('#src/util/website');
const { displayGear } = require("#src/boxcritters/displayGear");

async function getPlayer(id) {
	return await Website.Connect("https://boxcritters.com/data/player/" + id).getJson();
}



let router = express.Router();

router.use(express.json());

router.get('/:player', async function (req, res) {
	let fileParts = req.params.player.split(".");
	let playerId = fileParts[0];
	let player = await getPlayer(playerId);
	if (player.nickname == "flines") player.critterID = "lizard";
	let imgBuffer = await displayGear(player);

	res.type("." + fileParts[fileParts.length - 1]);
	res.send(imgBuffer);
});

module.exports = router;