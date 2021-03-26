"use strict";
const Canvas = require('canvas');
const Website = require('#src/util/website');
const BC = require('./bc-site');


const itemList = Website.Connect("https://api.bcmc.ga/manifests/items");

let mediaRoot = "https://boxcritters.com/media/";
let legacyMediaRoot = "https://media.boxcritters.com/";

//ITEM IN PRFILE:://boxcritters.com/media/items/toque_blue/front.png
//Item min world: https://boxcritters.com/media/items/toque_blue/sprites.png
//ItemICON:https://boxcritters.com/media/items/toque_blue/icon_sm.png


async function loadImage(url) {
	return await Canvas.loadImage(url);
}

function drawURL(context, url, x, y, w, h) {
	return new Promise(async (res, rej) => {
		loadImage(url).then(image => {
			context.drawImage(image, x, y, w, h);
			res();
		}).catch(e => {
			console.log("Error with: " + url, e);
			res();
		});

	});
}

function drawImage(context, image, x, y, w, h) {
	context.drawImage(image, x, y, w, h);
}


function drawFrame(context, spriteSheet, frame, placement) {
	//["x", "y", "width", "height", "imageIndex", "regX", "regY"]
	let f = frame;
	frame = spriteSheet.frames[frame];
	/*console.log({f,frame,placement})*/
	context.drawImage(spriteSheet.images[frame[4]], frame[0]/* - frame[5]*/, frame[1]/*- frame[6]*/, frame[2], frame[3], placement.x - placement.regX - frame[5], placement.y - placement.regY - frame[6], frame[2], frame[3]);
}

async function displayGear(player) {
	console.log("Player", player);

	let canvas = Canvas.createCanvas(340, 400);
	let context = canvas.getContext('2d');
	if (player.critterId == "snail") {
		canvas.width = canvas.height = 128;
		drawURL(context, "https://cdn.discordapp.com/emojis/701095041426391091.png?v=1", 0, 0, canvas.width, canvas.height);
	}

	let items = await itemList.getJson();

	let rules = {
		hideNose: false,
		hideEars: false
	};

	let gearSlots = (player.gear || []).map(g => {
		let item = items.find(i => i.itemId == g) || {};
		for (const rule in rules) {
			rules[rule] = rules[rule] | item[rule];
		}
		return item.slot;
	});
	//[this.backs.ride,this.tail,this.backs.hand,this.backs.eyes,this.backs.ears,this.backs.head,this.backs.neck,this.backs.fuzz,this.backs.pack,this.backs.belt,this.backs.body,this.backs.mask,this.backs.face,this.skin,this.ears,this.slots.face,this.face,this.slots.mask,this.slots.body,this.slots.belt,this.slots.pack,this.slots.fuzz,this.slots.neck,this.slots.head,this.slots.ears,this.slots.eyes,this.nose,this.slots.hand,this.slots.ride]

	let layers = await BC.GetLayers(); //["backs.ride", "tail", "backs.hand", "backs.eyes", "backs.ears", "backs.head", "backs.neck", "backs.fuzz", "backs.pack", "backs.belt", "backs.body", "backs.mask", "backs.face", "skin", "ears", "slots.face", "face", "slots.mask", "slots.body", "slots.belt", "slots.pack", "slots.fuzz", "slots.neck", "slots.head", "slots.ears", "slots.eyes", "nose", "slots.hand", "slots.ride"];
	for (let layer of layers) {
		layer = layer.replace("backs", "back");
		let url;
		switch (layer) {
			case "tail":
			case "skin":
			case "ears":
			case "face":
			case "nose":
			case "feet":
				if (layer == "nose" && rules.hideNose) break;
				if (layer == "ears" && rules.hideEars) break;
				if (layer == "skin") layer = "body";
				url = legacyMediaRoot + `critters/${player.critterId
					|| "hamster"
					//|| "penguin"
					}/${layer}.png`;
				await drawURL(context, url, 0, 0, canvas.width, canvas.height);

				break;
			default: //Items
				let layerParts = layer.split("."),
					position = layerParts[0].replace("slots", "front"),
					slot = layerParts[1],
					gearId = gearSlots.indexOf(slot);
				if (gearId == -1) continue;
				let gear = player.gear[gearId];
				url = mediaRoot + `items/${gear}/${position}.png`;
				await drawURL(context, url, 0, 0, canvas.width, canvas.height);

				break;
		}
	}

	return canvas.toBuffer();
}

module.exports = { loadImage, drawURL, drawImage, displayGear, drawFrame };