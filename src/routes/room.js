const express = require("express");
const Canvas = require('canvas');
const CanvasGifEncoder = require('gif-encoder-2');
const { lcm } = require("mathjs");
const Website = require('#src/util/website');
const { drawImage,drawFrame,loadImage } = require("#src/boxcritters/displayGear");


const roomList = Website.Connect("https://boxcritters.herokuapp.com/base/rooms.json");

async function getRoom(roomId) {
	var rooms = await roomList.getJson()
	return rooms.find(r => r.roomId == roomId );
}


async function displayRoom(room,length) {
	var canvas = Canvas.createCanvas(room.width, room.height);
	var context = canvas.getContext('2d');

	var spriteSheetFile = Website.Connect(room.spriteSheet);
	var spriteSheet = await spriteSheetFile.getJson();
	room.background = await loadImage(room.background)
	room.foreground = await loadImage(room.foreground)
	spriteSheet.images = await Promise.all(spriteSheet.images.map(async url => await loadImage(url)))

	var layoutFile = Website.Connect(room.layout);
	var layout = await layoutFile.getJson();
	layout.playground.sort((a,b) => a.y-b.y);

	var gifLength = /*length||*/Object.values(spriteSheet.animations).map(a => a.frames.length).reduce((gifLength, frameCount) => lcm(gifLength, frameCount))
	vra max = 300;
	gifLength = gifLength>max?max:gifLength;
	console.log(gifLength);

	
	var gifEncoder = new CanvasGifEncoder(room.width, room.height,'octree',true,gifLength);

	gifEncoder.on('progress', percent => {
		console.log("generating gif " + percent + "%")
	  })

	gifEncoder.start();
	for (let f = 0; f < gifLength; f++) {
		//console.log("Frame: ",f+1,"/",gifLength);
		layout.playground.sort((a,b) => a.y-b.y);
		drawImage(context, room.background, 0, 0, canvas.width, canvas.height);
		for (let i in layout.playground) {
			var placement = layout.playground[i];
			var animation = spriteSheet.animations[placement.id];
			var frame = animation.frames[f % animation.frames.length]
			drawFrame(context, spriteSheet, frame, placement);
		}
		drawImage(context, room.foreground, 0, 0, canvas.width, canvas.height);
		gifEncoder.addFrame(context);
	}
	gifEncoder.finish();
	return gifEncoder.out.getData();
}


var router = express.Router();

router.use(express.json())

router.get('/:frames/:room?',async function(req,res){
	var fileParts = (req.params.room||req.params.frames).split(".")
	var roomId =fileParts[0];
	var frames;
	if(req.params.room) frames = req.params.frames
	if(frames=="static"||frames<1)frames=1;
	var room = await getRoom(roomId); 
	var imgBuffer = await displayRoom(room,frames)

	res.type('.' + fileParts[fileParts.length-1]);
	res.send(imgBuffer);
})

module.exports = router;
