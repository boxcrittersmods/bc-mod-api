const express = require("express");
const Canvas = require('canvas');
const CanvasGifEncoder = require('gif-encoder-2');
const { lcm } = require("mathjs");
const Website = require('#src/util/website');


const roomList = Website.Connect("https://boxcritters.herokuapp.com/base/rooms.json");

async function getRoom(roomId) {
	var rooms = await roomList.getJson()
	return rooms.find(r => r.roomId == roomId );
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

async function displayRoom(room,length) {
	var canvas = Canvas.createCanvas(room.width, room.height);
	var context = canvas.getContext('2d');
	var gifEncoder = new CanvasGifEncoder(room.width, room.height,'neuquant',true);

	var spriteSheetFile = Website.Connect(room.spriteSheet);
	var spriteSheet = await spriteSheetFile.getJson();
	spriteSheet.images = await Promise.all(spriteSheet.images.map(async url => await Canvas.loadImage(url)))

	var layoutFile = Website.Connect(room.layout);
	var layout = await layoutFile.getJson();
	layout.playground.sort((a,b) => b.y-a.y);

	var gifLength = length||Object.values(spriteSheet.animations).sort((a,b)=>b.frames.length-a.frames.length)[0].frames.length//Object.values(spriteSheet.animations).map(a => a.frames.length).reduce((gifLength, frameCount) => lcm(gifLength, frameCount))
	console.log(gifLength);

	gifEncoder.start();
	for (let f = 0; f < gifLength; f++) {
		console.log("Frame: ",f+1,"/",gifLength);
		await drawImage(context, room.background, 0, 0, canvas.width, canvas.height);
		layout.playground.sort((a,b) => a.y-b.y);
		for (let i in layout.playground) {
			var placement = layout.playground[i];
			var animation = spriteSheet.animations[placement.id];
			var frame = animation.frames[f % animation.frames.length]
			drawFrame(context, spriteSheet, frame, placement);
		}
		await drawImage(context, room.foreground, 0, 0, canvas.width, canvas.height);
		gifEncoder.addFrame(context);
	}
	gifEncoder.finish();
	//var attachment = new Discord.MessageAttachment(canvas.toBuffer(), room.roomId + ".png")
	/*var attachment = new Discord.MessageAttachment(gifEncoder.out.getData(), room.roomId + ".gif")


	return attachment;*/
	return gifEncoder.out.getData();
}


var router = express.Router();

router.use(express.json())

router.get('/:length/:room?',async function(req,res){
	var fileParts = (req.params.room||req.params.length).split(".")
	var roomId =fileParts[0];
	var length = req.params.room?req.params.length:undefined
	console.log(roomId)
	var room = await getRoom(roomId); 
	var imgBuffer = await displayRoom(room,length)

	res.type('image/' + fileParts[fileParts.length-1]);
	res.send(imgBuffer);
})

module.exports = router;
