const express = require("express");
const {displayGear} = require("#src/boxcritters/displayGear");




var router = express.Router();

router.use(express.json())

router.get('/:critterId',async function(req,res){
	var fileParts = req.params.critterId.split(".")
	var critterId = fileParts[0]
	var gear = Object.keys(req.query)
	var imgBuffer = await displayGear({critterId,gear});

	res.type("."+fileParts[fileParts.length-1]);
	res.send(imgBuffer);
})

module.exports = router;