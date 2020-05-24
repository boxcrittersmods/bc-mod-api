const BoxCritters = require("./bc-site");
const bcVersions = require("./versions");
const Website = require('#src/util/website');
const path = require('path');

//data
const textureDataJson = require('#data/texture-data.json');
const textureMisc = require('#data/misc-textures.json');
const sitesJson = require('#data/sites.json');
const critterballJson = require('#data/critterball.json');

var SITE_URL = getSiteUrl();

Object.defineProperty(Array.prototype, 'reduceAsync', {
    value:  async function(action,def) {
	var output = def;
	for(var i in this) {
		output = await action(output,this[i],i);
	}
	return output;
}
});

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
	for (i = 0; i < frags.length; i++) {
		frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
	}
	return frags.join(' ');
}

function camelize(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
		return index == 0 ? word.toLowerCase() : word.toUpperCase();
	}).replace(/\s+/g, '');
}

function explode(obj) {
	return Object.keys(obj).reduce((pieces,key)=>{
		var value = obj[key];
		if(Array.isArray(value)) return Object.assign(pieces,value.reduce((arrObj,item,i)=>{
			var suffix = value.length>1?i:"";
			arrObj[key + suffix] = item;
			return arrObj;
		},{}))
		if(typeof value == "object") return Object.assign(pieces,explode(value));
		pieces[key] = value;
		return pieces
	},{});
}

function GetClientScript()
{
	return "https://play.boxcritters.com/lib/client.min.js";
}

function urlIsRoot(url) {
	return url.startsWith("http://") || url.startsWith("https://");
}

function getSiteUrl(site = 'play.boxcritters') {
	return sitesJson.find(s => s.name == site).url;
}

async function fillURL(url,type) {
	if(!url) return "";
	//var paths = await BoxCritters.GetPaths();
	var base = SITE_URL;
	if (urlIsRoot(url)) {
		return url;
	} else {
		return base + url;
	}
}

async function getSprites(spriteSheet,name,type) {
	var host = getSiteUrl("play.boxcritters");
	var url = host + spriteSheet;
	var website = Website.Connect(url);
	var sprites = await website.getJson();

	return sprites.images.reduceAsync(async (tp,sprite,i) =>{
		var value = await fillURL(sprite,type);
		var key = name;
		if(sprites.images.length<=1) {
			return value;
		}
		key +="_"+i;
		tp[key] = value;
		return tp;
	},{});
}

async function getAssetInfo(type, site = 'play.boxcritters') {
	var host = getSiteUrl(site);
	var manifests = await BoxCritters.GetManifests();
	var loc = manifests[type];
	var url = host + loc;
	var website = Website.Connect(url);
	var assetInfo = await website.getJson();

	return assetInfo;
}

async function GetManifestLoc() {
	var manifests = await BoxCritters.GetManifests();
	var tp = Object.keys(manifests).reduceAsync(async (tp, m) => {
		console.log("Manifest: " + m)
		tp[m + "_manifest"] = await fillURL(manifests[m]);
		return tp;
	}, {});
	return tp;
}

async function GetCritters() {
	var critters = await getAssetInfo('critters');
	var mascots = await getAssetInfo('mascots');
	var tp = {};
	tp.critters = await critters.reduceAsync(async (tp, critterData) => {
		console.log("Critter: " +critterData.critterId);
		tp[critterData.critterId] = await getSprites(critterData.spriteSheet,critterData.critterId,"critters");
		return tp;
	}, {});
	tp.mascots = await mascots.reduceAsync(async (tp, critterData) => {
		console.log("Mascot: " +critterData.critterId);
		tp[critterData.critterId] = await getSprites(critterData.spriteSheet,critterData.critterId,"mascots");
		return tp;
	}, {});
	return tp;
}
/*async function GetEffects() {
	var siteUrl = getSiteUrl();
	var effects = await getAssetInfo('effects');
	console.log(effects);
	//var tp = await getSprites(effects,"effects","effects");
	return tp;
}*/
async function GetItems() {
	var itemsData = await getAssetInfo('items');
	var sheetsUsed = [];
	var tp = itemsData.reduceAsync(async (tp,itemData) => {
		if(!sheetsUsed.includes(itemData.spriteSheet)) {
			sheetsUsed.push(itemData.spriteSheet)
			var spriteSheetParts = itemData.spriteSheet.split("/");
			var series = "items_"+spriteSheetParts[3];
			console.log("ItemSheet: " +series);
			tp[series] = await getSprites(itemData.spriteSheet,series,'items');
		}
		return tp;
	},{});
	return tp;
}
async function GetIcons() {
	var itemsData = await getAssetInfo('items');
	var tp = await itemsData.reduceAsync(async (tp,itemData) => {
		console.log("Item: " +itemData.itemId);

		var theme = itemData.theme||'normal';
		var slot = itemData.slot;
		tp[theme] = tp[theme]||{};
		tp[theme][slot] = tp[theme][slot]||{};
		tp[theme][slot][itemData.itemId] = await fillURL(itemData.icon,"icons");

		return tp;
	},{});
	return tp;
}

async function GetRooms() {
	var rooms = await getAssetInfo('rooms');
	var tp = rooms.reduceAsync(async (tp, roomData) => {
		console.log("Room: " +roomData.roomId);
		roomData.serverMap = "/map_server.png"
		roomData.serverMap = roomData.background.replace("background","map_server");
	var room = {}
		if(roomData.background) room[roomData.roomId + "_bg"] =  await fillURL(roomData.background,'rooms');
		if(roomData.foreground) room[roomData.roomId + "_fg"] = await fillURL(roomData.foreground,'rooms');
		if(roomData.navMesh) room[roomData.roomId + "_nm"]= await fillURL(roomData.navMesh,'rooms');
		if(roomData.map) room[roomData.roomId + "_map"]= await fillURL(roomData.map,'rooms');
		if(roomData.serverMap) room[roomData.roomId + "_server_map"]= await fillURL(roomData.serverMap,'rooms');
		if(roomData.music) room[roomData.roomId + "_music"]= await fillURL(roomData.music,'rooms');
		if(roomData.spriteSheet) room[roomData.roomId + "_sprites"]= await getSprites(roomData.spriteSheet,roomData.roomId + "_sprites",'rooms');
		
		tp[roomData.roomId] = room;
		return tp;

	}, {});
	return tp;
}

async function GetCritterBall() {
	var tp = critterballJson;
	return tp;
}

async function GetTextureData() {
	//var symbols = await GetSymbols();

	var tp = {
		clientscript: await GetClientScript(),
		misc: textureMisc,
		manifests: await GetManifestLoc(),
		critters: await GetCritters(),
		//effects: await GetEffects(),
		items: await GetItems(),
		icons: await GetIcons(),
		rooms: await GetRooms(),
		critterball: await GetCritterBall()
	}
	return tp;
}

async function GetTextureList() {
	var things = await GetTextureData();
	var tp = explode(things);
	//tp.packVersion = "UNKNOWN";
	return tp;
}

module.exports = {
	getAssetInfo,
	GetClientScript,
	GetManifestLoc,
	//GetCritters,
	//GetItems,
	//GetIcons,
	GetCritterBall,
	GetTextureData,
	GetTextureList
}
