const express = require("express");
const Canvas = require('canvas');
var mime = require('mime-types')
const Website = require('#src/util/website');

const itemList = Website.Connect("https://boxcritters.herokuapp.com/base/items.json");


async function getPlayer(id) {
	return await Website.Connect("https://boxcritters.com/data/player/" + id).getJson()
}

function drawImage(context, url, x, y, w, h) {
	return new Promise(async (res, rej) => {
		Canvas.loadImage(url).then(image => {
			context.drawImage(image, x, y, w, h)
			res();
		}).catch(e => {
			console.log("Error with: " + url)
			res();
		});

	})
}

function drawFrame(context, spriteSheet, frame, placement) {
	//["x", "y", "width", "height", "imageIndex", "regX", "regY"]
	var frame = spriteSheet.frames[frame];
	context.drawImage(spriteSheet.images[frame[4]], frame[0] - frame[5], frame[1] - frame[6], frame[2], frame[3], placement.x - placement.regX, placement.y - placement.regY, frame[2], frame[3]);
}

async function displayPlayer(player) {

	var canvas = Canvas.createCanvas(340, 400);
	var context = canvas.getContext('2d');
	if (player.critterId == "snail") {
		canvas.width = canvas.height = 128;
		drawImage(context, "https://cdn.discordapp.com/emojis/701095041426391091.png?v=1", 0, 0, canvas.width, canvas.height)
	}

	var items = await itemList.getJson();

	var rules = {
		hideNose: false,
		hideEars: false
	}

	var gearSlots = player.gear.map(g => {
		var item = items.find(i => i.itemId == g);
		for (const rule in rules) {
			rules[rule] = rules[rule] | item[rule]
		}
		return item.slot;
	})

	var layers = ["feet", "back.ride", "tail", "back.hand", "back.eyes", "back.ears", "back.head", "back.neck", "back.fuzz", "back.pack", "back.belt", "back.body", "back.mask", "body", "ears", "face", "slots.mask", "slots.body", "slots.belt", "slots.pack", "slots.fuzz", "slots.neck", "slots.head", "slots.ears", "slots.eyes", "nose", "slots.hand", "slots.ride"]
	for (var layer of layers) {
		switch (layer) {
			case "tail":
			case "body":
			case "ears":
			case "face":
			case "nose":
			case "feet":
				if (layer == "nose" && rules.hideNose) break;
				if (layer == "ears" && rules.hideEars) break;
				var url = `https://media.boxcritters.com/critters/${player.critterId||"hamster"}/${layer}.png`
				await drawImage(context, url, 0, 0, canvas.width, canvas.height)

				break;
			default: //Items
				var layerParts = layer.split(".");
				var position = layerParts[0].replace("slots", "front");
				var slot = layerParts[1];
				var gearId = gearSlots.indexOf(slot)
				if (gearId == -1) continue;
				var gear = player.gear[gearId];
				var url = `https://media.boxcritters.com/items/${gear}/${position}.png`;
				await drawImage(context, url, 0, 0, canvas.width, canvas.height)

				break;
		}
	}

	return canvas.toBuffer()
}


var router = express.Router();

router.use(express.json())

router.get('/:player',async function(req,res){
	var fileParts = req.params.player.split(".")
	var playerId = fileParts[0];
	var player = await getPlayer(playerId); 
	var imgBuffer = await displayPlayer(player)

	res.type(mime.lookup("."+fileParts[fileParts.length-1]));
	res.send(imgBuffer);
})

module.exports = router;