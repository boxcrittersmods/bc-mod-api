const BoxCritters = require("./bc-site");
const bcVersions = require("./versions");
const Website = require('#src/util/website');
const path = require('path');

//data
const textureDataJson = require('#data/texture-data.json');
const sitesJson = require('#data/sites.json');
const critterballJson = require('#data/critterball.json');
const roomsJson = require('#data/rooms.json')

function dynamicSort(property) {
	var sortOrder = 1;
	if (property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function (a, b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
		var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
		return result * sortOrder;
	}
}

function camelize(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
		return index == 0 ? word.toLowerCase() : word.toUpperCase();
	}).replace(/\s+/g, '');
}

function GetClientScript() {
	var ver = bcVersions.GetLatest() || { name: 'LOCAL', items: "LOCAL" };
	var tp = {
		"name": "client-script",
		"label": "Client Script",
		"hidden": true,
		"site": "boxcritters",
		"type": "js",
		"filename": `client${ver.name}.js`
	};
	return tp;
}
/*{
    "name": "beaver",
    "label": "Beaver",
    "site": "boxcritters",
    "type": "media",
    "category": "critters",
  },
*/
async function GetCritters() {
	var host = sitesJson.find(s => s.name == 'boxcritters').url;
	var manifests = await BoxCritters.GetManifests();
	var loc = manifests.find(m => m.id == 'critters').src;
	var url = host + loc;
	var website = Website.Connect(url);
	var critters = await website.getJson();
	var tp = critters.map(critter => ({
		"name": `${critter.critterId}`,
		"label": `${critter.name}`,
		"site": "boxcritters",
		"type": "media",
		"category": `critters/${critter.type}`,
		"filename": `${critter.images[0].replace('/media/critters/', '')}`
	}));
	return tp;

}
async function GetSymbols() {
	var host = sitesJson.find(s => s.name == 'boxcritters').url;
	var manifests = await BoxCritters.GetManifests();
	var loc = manifests.find(m => m.id == 'symbols').src;
	var url = host + loc;
	var website = Website.Connect(url);
	var symbols = (await website.getJson()).images;
	var tp = symbols.map(symbol => ({
		"name": `${path.basename(symbol, path.extname(symbol))}`,
		"site": "boxcritters",
		"type": "media",
		"category": "symbols"
	}));
	return tp;
}
async function GetEffects() {
	var host = sitesJson.find(s => s.name == 'boxcritters').url;
	var manifests = await BoxCritters.GetManifests();
	var loc = manifests.find(m => m.id == 'effects').src;
	var url = host + loc;
	var website = Website.Connect(url);
	var effects = (await website.getJson()).images;
	var tp = effects.map(effect => ({
		"name": `${path.basename(effect, path.extname(effect))}`,
		"site": "boxcritters",
		"type": "media",
		"category": "effects"
	}));
	return tp;
}
async function GetItems() {
	var host = sitesJson.find(s => s.name == 'boxcritters').url;
	var manifests = await BoxCritters.GetManifests();
	var loc = manifests.find(m => m.id == 'items').src;
	var url = host + loc;
	var website = Website.Connect(url);
	var itemsData = await website.getJson();
	var items = itemsData.images;
	var tp = items.map(item => ({
		"name": `${path.basename(item, path.extname(item))}`,
		"site": "boxcritters",
		"type": "media",
		"category": "items",
		"filename": `${itemsData.build}/${path.basename(item, path.extname(item))}.png`
	}));
	return tp;
}
async function GetIcons() {
    /*var icons = iconsJson;
    var tp = icons.map(icon => ({
        "name": `${icon.name}`,
        "site": "boxcritters",
        "type": "media",
        "category": `icons/${icon.slot}`
    }));*/
	var host = sitesJson.find(s => s.name == 'boxcritters').url;
	var manifests = await BoxCritters.GetManifests();
	var loc = manifests.find(m => m.id == 'items').src;
	var url = host + loc;
	var website = Website.Connect(url);
	var itemsData = await website.getJson();
	var icons = Object.keys(itemsData.items);
	var tp = icons.map(icon => ({
		"name": `${icon}`,
		"site": "boxcritters",
		"type": "media",
		"category": `icons`
	}));

	return tp;
}
async function GetRooms() {
	var tp = roomsJson.reduce((rooms, room) => {
		rooms.push(...[
			{
				"name": `${camelize(room.name)}BG`,
				"label": `${room.name} Background`,
				"site": `boxcritters-base`,
				"type": `media`,
				"category": `rooms/${camelize(room.name)}`,
				"filename": room.background
			},
			{
				"name": `${camelize(room.name)}FG`,
				"label": `${room.name} Foreground`,
				"site": `boxcritters-base`,
				"type": `media`,
				"category": `rooms/${camelize(room.name)}`,
				"filename": room.foreground
			},
			{
				"name": `${camelize(room.name)}Props`,
				"label": `${room.name} Spritesheet`,
				"site": `boxcritters-base`,
				"type": `media`,
				"category": `rooms/${camelize(room.name)}`,
				"filename": room.spritesheet
			}
		]);
		return rooms;

	},[]);
	return tp;
	return [];
}

async function GetCritterBall() {
	var tp = critterballJson.map(t => ({
		"name": t.name,
		"label": t.label,
		"site": "critterball",
		"type": t.type,
		"category": t.category
	}));
	return tp;
}

async function GetTextureData() {
	var clientscript = GetClientScript();

	var critters = await GetCritters();
	critters = critters.sort(dynamicSort('name'));
	critters = critters.sort(dynamicSort('category'));

	var symbols = await GetSymbols();
	var effects = await GetEffects();
	var items = await GetItems();
	var icons = await GetIcons();
	var rooms = await GetRooms();
	var critterball = await GetCritterBall();


	var textures = Object.assign([], textureDataJson);
	textures.push(clientscript);
	textures.push(...critters);
	textures.push(...symbols);
	textures.push(...effects);
	textures.push(...items);
	textures.push(...icons);
	textures.push(...rooms);
	textures.push(...critterball);
	return textures;
}


//JSON.stringify(world.player.inventory.map(i => ({"name":i.itemId,"slot":i.slot}))
module.exports = {
	GetTextureData
}