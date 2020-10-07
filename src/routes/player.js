const express = require("express");
const Website = require('#src/util/website');
const {displayGear} = require("#src/boxcritters/displayGear");

async function getPlayer(id) {
	return await Website.Connect("https://boxcritters.com/data/player/" + id).getJson()
}



var router = express.Router();

router.use(express.json())

router.get('/:player',async function(req,res){
	var fileParts = req.params.player.split(".")
	var playerId = fileParts[0];
	var player = await getPlayer(playerId); 
	var imgBuffer = await displayGear(player)

	res.type("."+fileParts[fileParts.length-1]);
	res.send(imgBuffer);
})

module.exports = router;