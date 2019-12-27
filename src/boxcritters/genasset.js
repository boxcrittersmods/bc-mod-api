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

function idToLabel(id) {
	var frags = id.split('_');
	for (i=0; i<frags.length; i++) {
	  frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
	}
	return frags.join(' ');
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

async function GetManifestLoc() {
	var host = sitesJson.find(s => s.name == 'boxcritters').url;
	var manifests = await BoxCritters.GetManifests();
	var tp = manifests.map(m=>({
		"name": `${m.id}Manifest`,
		"site": "boxcritters",
		"type": "manifests",
		"filename": `${m.src.charAt(0)=='/'? m.src.substr(1):m.src}`
	}));
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
		"label": `${idToLabel(icon)}`,
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

	var manifests = await GetManifestLoc();

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
	textures.push(...manifests);
	textures.push(...critters);
	textures.push(...symbols);
	textures.push(...effects);
	textures.push(...items);
	textures.push(...icons);
	textures.push(...rooms);
	textures.push(...critterball);
	return textures;
}

function getTextureURL(texture) {
	var versionInfo = bcVersions.GetLatest() || { name: 'LOCAL', items: "LOCAL" };;
    var site = sitesJson.find(s=>s.name==texture.site);
    if(!site) return;
    var catList = texture.category ? texture.category.split("/"):[""];
    var subType = catList[0];
    var dirset =  site[texture.type];
    var filename = texture.filename || texture.name + ".png";
    filename = filename.replace("{CLIENTVER}",versionInfo.name);
    filename = filename.replace("{ITEMVER}",versionInfo.items);
    var dir = "";
    if(typeof dirset == "object" && subType) {
        dir = dirset[subType];
    } else {
        dir = dirset;
    }
    var textureurl = site.url + dir + filename;
    //console.debug(texture.name + " => " + textureurl);
    return textureurl;
}

function getTexturePath(texture) {
	var versionInfo = bcVersions.GetLatest() || { name: 'LOCAL', items: "LOCAL" };;
    var site = sitesJson.find(s=>s.name==texture.site);
    if(!site) return;
    var catList = texture.category ? texture.category.split("/"):[""];
    var subType = catList[0];
    var dirset =  site[texture.type];
    var filename = texture.filename || texture.name + ".png";
    filename = filename.replace("{CLIENTVER}",versionInfo.name);
    filename = filename.replace("{ITEMVER}",versionInfo.items);
    var dir = "";
    if(typeof dirset == "object" && subType) {
        dir = dirset[subType];
    } else {
        dir = dirset;
    }
    var textureurl = dir + filename;
    //console.debug(texture.name + " => " + textureurl);
    return textureurl;
}

async function GetTextureList() {
	return (await GetTextureData())
	.filter(tp=>!["name","author","date","packVersion","description"].includes(tp.name))
	.map(getTextureURL)
}
async function GetPathList() {
	return (await GetTextureData())
	.filter(tp=>!["name","author","date","packVersion","description"].includes(tp.name))
	.map(getTexturePath)
}


//GetTextureList().then(console.log);


//JSON.stringify(world.player.inventory.map(i => ({"name":i.itemId,"slot":i.slot}))
module.exports = {
	GetTextureData,
	GetTextureList,
	GetPathList
}