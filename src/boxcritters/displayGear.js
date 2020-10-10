
const Canvas = require('canvas');
const Website = require('#src/util/website');
const Cache = require("#src/util/cache");


const itemList = Website.Connect("https://boxcritters.herokuapp.com/base/items.json");

const imageCache = new Cache();

async function loadImage(url) {
	/*return new Promise((res,rej)=>{
		imageCache.isCached(url, (exist)=>{
			if(exist) {
				imageCache.getCache(url, function(error, image) {
					resolve(await Canvas.loadImage(image));
				 });
			}
		});
	})*/
	/*var image = imageCache.get(url);
	if(image===undefined) {
		image = await Canvas.loadImage(url);
		imageCache.set(url,image);
	}
	console.log({[url]:image})
	return image;*/
	return await Canvas.loadImage(url);
}

function drawURL(context, url, x, y, w, h) {
	return new Promise(async (res, rej) => {
		loadImage(url).then(image => {
			context.drawImage(image, x, y, w, h)
			res();
		}).catch(e => {
			console.log("Error with: " + url,e)
			res();
		});

	})
}

function drawImage(context, image, x, y, w, h) {
	context.drawImage(image, x, y, w, h)
}


function drawFrame(context, spriteSheet, frame, placement) {
	//["x", "y", "width", "height", "imageIndex", "regX", "regY"]
	var frame = spriteSheet.frames[frame];
	context.drawImage(spriteSheet.images[frame[4]], frame[0] - frame[5], frame[1] - frame[6], frame[2], frame[3], placement.x - placement.regX, placement.y - placement.regY, frame[2], frame[3]);
}

async function displayGear(player) {
	console.log("Player",player)

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
		var item = items.find(i => i.itemId == g)||{};
		for (const rule in rules) {
			rules[rule] = rules[rule] | item[rule]
		}
		return item.slot;
	})


	var layers = ["backs.ride", "tail", "backs.hand", "backs.eyes", "backs.ears", "backs.head", "backs.neck", "backs.fuzz", "backs.pack", "backs.belt", "backs.body", "backs.mask", "backs.face", "skin", "ears", "slots.face", "face", "slots.mask", "slots.body", "slots.belt", "slots.pack", "slots.fuzz", "slots.neck", "slots.head", "slots.ears", "slots.eyes", "nose", "slots.hand", "slots.ride"]
	layers.unshift("feet")
	for (var layer of layers) {
		layer = layer.replace("backs","back");
		switch (layer) {
			case "tail":
			case "skin":
			case "ears":
			case "face":
			case "nose":
			case "feet":
				if (layer == "nose" && rules.hideNose) break;
				if (layer == "ears" && rules.hideEars) break;
				if(layer == "skin") layer = "body";
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

module.exports = {loadImage,drawURL,drawImage,displayGear,drawFrame};