"use strict";
const express = require("express");
const Canvas = require('canvas');
const CanvasGifEncoder = require('gif-encoder-2');
const { lcm } = require("mathjs");
const Website = require('#src/util/website');
const { drawImage, drawVideo, drawFrame, loadImage, loadVideo } = require("#src/boxcritters/displayGear");
const { GetManifests } = require("../boxcritters/bc-site");

async function getRoom(roomId) {
	let rooms = await Website.Connect((await GetManifests()).rooms.src).getJson();
	return rooms.find(r => r.roomId == roomId);
}


async function displayRoom(room, length) {
	if (!room) return;
	let canvas = Canvas.createCanvas(room.width, room.height);
	let context = canvas.getContext('2d');
	console.log("1");

	let data = {};
	let spriteSheet = typeof room.spriteSheet == "string" ? await Website.Connect(room.spriteSheet).getJson() : room.spriteSheet;
	if (room.media.video) data.video = await loadVideo(room.media.video, length);
	if (room.media.background) data.background = await loadImage(room.media.background);
	if (room.media.foreground) room.foreground = await loadImage(room.media.foreground);
	if (spriteSheet.images) spriteSheet.images = await Promise.all(spriteSheet.images.map(async url => await loadImage(url)));

	let layout;
	layout = room.layout;
	/*if (!layout) {
		let layoutFile = Website.Connect(room.layout);
		layout = await layoutFile.getJson();
	}*/
	if (layout) {
		if (Array.isArray(layout.playground) && Array.isArray(layout.playground[0])) {
			layout.playground = [].concat.apply([], layout.playground);
		}
		layout.playground.sort((a, b) => a.y - b.y);
	}

	let gifLength = length || Object.values(spriteSheet.animations).map(a => a.frames.length).reduce((gifLength, frameCount) => lcm(gifLength, frameCount));
	if (data.video) gifLength = lcm(gifLength, data.video.frames.length);
	let max = 30;
	if (!length) gifLength = gifLength > max ? max : gifLength;
	console.log("GifLength:", gifLength);


	let gifEncoder = new CanvasGifEncoder(room.width, room.height, 'neuquant', true, gifLength);

	gifEncoder.start();
	for (let f = 0; f < gifLength; f++) {
		console.debug("Frame: ", f + 1, "/", gifLength);
		layout.playground.sort((a, b) => a.y - b.y);
		if (data.video) await drawVideo(context, data.video, 0, 0, canvas.width, canvas.height);
		if (data.background) drawImage(context, data.background, 0, 0, canvas.width, canvas.height);
		if (layout && spriteSheet.images) {
			for (let i in layout.playground) {
				let placement = layout.playground[i];
				if (typeof placement == "undefined") {
					console.log(`Playground ${i} has no placement`);
					continue;
				}
				let animation = spriteSheet.animations[placement.id];
				if (typeof animation == "undefined") {
					console.log(`Playground ${i},placement ${placement.id} has no animation`);
					continue;
				}
				let frame = animation.frames[f % animation.frames.length];
				if (typeof frame == "undefined") {
					console.log(`Playground ${i},placement ${placement.id}, frame ${f} does not exist`);
					continue;
				}

				drawFrame(context, spriteSheet, frame, placement);
			}
		}
		if (data.foreground) drawImage(context, data.foreground, 0, 0, canvas.width, canvas.height);
		gifEncoder.addFrame(context);
	}
	gifEncoder.finish();
	return gifEncoder;
}


let router = express.Router();

router.use(express.json());

router.get('/:frames/:room?', async function (req, res) {
	let fileParts = (req.params.room || req.params.frames).split(".");
	let roomId = fileParts[0];
	let frames;
	if (req.params.room) frames = req.params.frames;
	if (frames == "static" || frames < 1) frames = 1;
	let room = await getRoom(roomId);
	if (!room) return res.status(404).send("No Room found");

	let imgBuffer = await displayRoom(room, frames);

	res.type('.' + fileParts[fileParts.length - 1]);
	let data = imgBuffer.out.getData();
	res.send(data);
});

module.exports = router;
