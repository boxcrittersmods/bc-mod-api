const express = require("express");
const Canvas = require('canvas');
const CanvasGifEncoder = require('gif-encoder-2');
const { lcm } = require("mathjs");
const Website = require('#src/util/website');
const { drawImage, drawFrame, loadImage } = require("#src/boxcritters/displayGear");


const roomList = Website.Connect("https://boxcritters.herokuapp.com/base/rooms.json");

async function getRoom(roomId) {
	var rooms = await roomList.getJson()
	return rooms.find(r => r.roomId == roomId);
}


async function displayRoom(room, length) {
	if (!room) return;
	var canvas = Canvas.createCanvas(room.width, room.height);
	var context = canvas.getContext('2d');
	console.log("1")

	var spriteSheetFile = Website.Connect(room.spriteSheet);
	var spriteSheet = await spriteSheetFile.getJson();
	if (room.background) room.background = await loadImage(room.background)
	if (room.foreground) room.foreground = await loadImage(room.foreground)
	if (spriteSheet.images) spriteSheet.images = await Promise.all(spriteSheet.images.map(async url => await loadImage(url)))

	if (room.playground) var layout = { playground: room.playground };
	if (!layout) {
		var layoutFile = Website.Connect(room.layout);
		layout = await layoutFile.getJson();
	}
	if (layout) {
		if (Array.isArray(layout.playground) && Array.isArray(layout.playground[0])) {
			layout.playground = [].concat.apply([],layout.playground);
		}
		layout.playground.sort((a, b) => a.y - b.y);
	}




	var gifLength = length || Object.values(spriteSheet.animations).map(a => a.frames.length).reduce((gifLength, frameCount) => lcm(gifLength, frameCount))
	var max = 30;
	if (!length) gifLength = gifLength > max ? max : gifLength;
	console.log(gifLength);


	var gifEncoder = new CanvasGifEncoder(room.width, room.height, 'neuquant', true, gifLength);

	/*gifEncoder.on('progress', percent => {
		console.log("generating gif " + percent + "%")
	  })*/

	gifEncoder.start();
	for (let f = 0; f < gifLength; f++) {
		console.debug("Frame: ", f + 1, "/", gifLength);
		layout.playground.sort((a, b) => a.y - b.y);
		drawImage(context, room.background, 0, 0, canvas.width, canvas.height);
		if (layout && spriteSheet.images) {
			for (let i in layout.playground) {
				var placement = layout.playground[i];
				if (!placement) {
					console.log(`Playground ${i} has no placement`)
					continue;
				}
				var animation = spriteSheet.animations[placement.id];
				if (!animation) {
					console.log(`Playground ${i},placement ${placement.id} has no animation`)
					continue;
				}
				var frame = animation.frames[f % animation.frames.length]
				if (!frame) {
					console.log(`Playground ${i},placement ${placement.id}, frame ${f} does not exist`)
					continue;
				}
				drawFrame(context, spriteSheet, frame, placement);
			}
		}
		if (room.foreground) drawImage(context, room.foreground, 0, 0, canvas.width, canvas.height);
		gifEncoder.addFrame(context);
	}
	gifEncoder.finish();
	return gifEncoder;
}


var router = express.Router();

router.use(express.json())

router.get('/:frames/:room?', async function (req, res) {
	var fileParts = (req.params.room || req.params.frames).split(".")
	var roomId = fileParts[0];
	var frames;
	if (req.params.room) frames = req.params.frames
	if (frames == "static" || frames < 1) frames = 1;
	var room = await getRoom(roomId);
	if (!room) return res.status(404).send("No Room found")

	var imgBuffer = await displayRoom(room, frames)

	res.type('.' + fileParts[fileParts.length - 1]);
	var data = imgBuffer.out.getData();
	res.send(data);
})

module.exports = router;
