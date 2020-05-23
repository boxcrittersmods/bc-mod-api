const BoxCritters = require("./bc-site");
const bcVersions = require("./versions");
const Website = require('#src/util/website');
const path = require('path');

//data
const textureDataJson = require('#data/texture-data.json');
const textureMisc = require('#data/misc-textures.json');
const sitesJson = require('#data/sites.json');
const critterballJson = require('#data/critterball.json');

var SITE_URL= getSiteUrl();

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

async function GetClientScript() {
	var siteUrl = getSiteUrl();
	var tp = await BoxCritters.GetClientScriptURL()
	tp = tp.replace("..",siteUrl);
	return tp;
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

async function getSprites(sprites,name,type) {
	return sprites.images.reduceAsync(async (tp,sprite,i) =>{
		var value = await fillURL(sprite,type);
		var key = name;
		if(sprites.images.length>1) key +=""+i;
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
		tp[m + "_manifest"] = await fillURL(manifests[m]);
		return tp;
	}, {});
	return tp;
}

async function GetCritters() {
	var critters = await getAssetInfo('critters');
	var mascots = await getAssetInfo('mascots');
	var tp = {};
	tp.critters = await critters.reduceAsync(async (tp, critter) => {
		tp[critter.CritterId] = await getSprites(critter.Sprites,critter.CritterId,"critters");
		return tp;
	}, {});
	tp.mascots = await mascots.reduceAsync(async (tp, mascot) => {
		tp[mascot.MascotId] = await getSprites(mascot.Sprites,mascot.MascotId,"mascots");
		return tp;
	}, {});
	return tp;
}
async function GetEffects() {
	var siteUrl = getSiteUrl();
	var effects = await getAssetInfo('effects');
	var tp = await getSprites(effects,"effects","effects");
	return tp;
}
async function GetItems() {
	var itemsData = await getAssetInfo('items');
	var tp = await getSprites(itemsData.Sprites,"items","items")
	/*var tp = await items.reduceAsync(async (tp,item) => {
		var id = path.basename(item, path.extname(item));
		console.log(id);
		tp[id]= await fillURL(item,'items');
		return tp;
	},{});*/
	return tp;
}
async function GetIcons() {
	var itemsData = await getAssetInfo('items');
	var tp = await itemsData.Items.reduceAsync(async (tp,item) => {
		var itemTp = {};
		itemTp[item.ItemId] = await fillURL("https://play.boxcritters.com/media/icons/" + item.ItemId + ".png");


		var theme = item.Theme||'normal';
		var slot = item.Slot;
		tp[theme] = tp[theme]||{};
		tp[theme][slot] = tp[theme][slot]||{};
		tp[theme][slot][item.ItemId] = itemTp;

		return tp;
	},{});
	return tp;
}

async function GetRooms() {
	var rooms = await getAssetInfo('rooms');
	var tp = rooms.reduceAsync(async (tp, roomData) => {
		
		console.log("Room: " +roomData.RoomId);
		roomData.ServerMap = "/map_server.png"
		roomData.ServerMap = roomData.Background.replace("background","map_server");
	var room = {}
		if(roomData.Background) room[roomData.RoomId + "_bg"] =   await fillURL(roomData.Background,'rooms');
		if(roomData.Foreground) room[roomData.RoomId + "_fg"] = await fillURL(roomData.Foreground,'rooms');
		if(roomData.NavMesh) room[roomData.RoomId + "_nm"]= await fillURL(roomData.NavMesh,'rooms');
		if(roomData.Map) room[roomData.RoomId + "_map"]= await fillURL(roomData.Map,'rooms');
		if(roomData.ServerMap) room[roomData.RoomId + "_server_map"]= await fillURL(roomData.ServerMap,'rooms');
		if(roomData.Sprites) room[roomData.RoomId + "_sprites"]= await getSprites(roomData.Sprites,roomData.RoomId + "_sprites",'rooms');
		
		tp[roomData.RoomId] = room;
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
		effects: await GetEffects(),
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
	tp.packVersion = (await BoxCritters.GetVersion())+"";
	return tp;
}

module.exports = {
	getAssetInfo,
	GetClientScript,
	GetManifestLoc,
	GetCritters,
	GetItems,
	GetIcons,
	GetCritterBall,
	GetTextureData,
	GetTextureList,
}
