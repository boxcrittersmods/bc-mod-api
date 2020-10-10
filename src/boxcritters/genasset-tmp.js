const BoxCritters = require("./bc-site");
const bcVersions = require("./versions");
const Website = require('#src/util/website');
const fs = require('await-fs');
const path = require('path');


  
//data
const textureMisc = require('#data/misc-textures.json');
const sitesJson = require('#data/sites.json');
const critterballJson = require('#data/critterball.json');
const shopJson = require('#data/shop.json');
const { type } = require("os");

var SITE_URL = getSiteUrl();

if (!String.prototype.endsWith) {
	String.prototype.endsWith = function (search, this_len) {
		if (this_len === undefined || this_len > this.length) {
			this_len = this.length;
		}
		return this.substring(this_len - search.length, this_len) === search;
	};
}

Object.defineProperty(Array.prototype, 'reduceAsync', {
	value: async function (action, def) {
		var output = def;
		for (var i in this) {
			output = await action(output, this[i], i);
		}
		return output;
	}
});

async function requireJson(path) {
	var data = await fs.readFile(require.resolve(path))
	return JSON.parse(data);
}


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
function titleize(str) {
	return str.replace(
		/\w\S*/g,
		function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		}
	);
}

function explode(obj, prefix) {
	return Object.keys(obj).reduce((pieces, key) => {
		var value = obj[key];
		if (typeof (prefix) == "string") key = prefix + "_" + key;
		if (Array.isArray(value)) return Object.assign(pieces, value.reduce((arrObj, item, i) => {
			var suffix = value.length > 1 ? i : "";
			arrObj[key + suffix] = item;
			return arrObj;
		}, {}))
		var p = undefined;
		if (prefix) p = key;
		if (typeof value == "object") return Object.assign(pieces, explode(value, p));
		pieces[key] = value;
		return pieces
	}, {});
}

function GetClientScript() {
	return "https://boxcritters.com/lib/client.min.js";
}

function urlIsRoot(url) {
	return url.startsWith("http://") || url.startsWith("https://");
}

function getSiteUrl(site = 'boxcritters') {
	return sitesJson.find(s => s.name == site).url;
}

async function fillURL(url) {
	if (!url) return "";
	//var paths = await BoxCritters.GetPaths();
	var base = SITE_URL;
	if (urlIsRoot(url)) {
		return url;
	} else {
		return base + url;
	}
}

async function getSprites(spriteSheet, name) {
	if(typeof(spriteSheet)=="string"&&spriteSheet.includes(".json")){
		var host = getSiteUrl("boxcritters");
		var url = host + spriteSheet;
		var website = Website.Connect(url);
		var sprites = await website.getJson();
	} else {
		sprites = spriteSheet;
	}

	return sprites.images.reduceAsync(async (tp, sprite, i) => {
		var value = await fillURL(sprite);
		var key = name;
		if (sprites.images.length <= 1) {
			return value;
		}
		key += "_" + i;
		tp[key] = value;
		return tp;
	}, {});
}

async function getAssetInfo(type, site = 'boxcritters') {
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
		console.debug("Manifest: " + m)
		tp[m + "_manifest"] = await fillURL(manifests[m]);
		return tp;
	}, {});
	return tp;
}

async function getObjectSchematic(obj) {
	obj = JSON.parse(JSON.stringify(obj));
	//console.log("DOCUMENTING OBJECT<" + (Array.isArray(obj) ? ("array" +"("+obj.length+")") : typeof (obj)) + ">:", obj);
	if (Array.isArray(obj)) {
		if (obj.length > 1 && typeof (obj[0]) === "object") {
			obj = Object.assign(...obj);
		} else if (obj.length == 0) {
			return "array";
		} else {
			obj = obj[0];
		}
	}
	if (typeof (obj) === "object")
		return Object.assign(...await Promise.all(Object.keys(obj).map(async k => ({ [k]: await getObjectSchematic(obj[k]) }))));
	if (typeof (obj) === "string") {
		if (obj.includes('.png'))
			return 'texture';
		if (obj.includes('.json')) {
			/*var url = await fillURL(obj);
			var website = Website.Connect(url);
			var assetInfo = await website.getJson();
			return await getObjectSchematic(assetInfo);*/
			return "json";
		}
	}
	return typeof (obj);
}
async function GetTextureData() {
	//var symbols = await GetSymbols();

	var manifests = await BoxCritters.GetManifests();
	var unregisteredTextures = await requireJson("#data/textures.json");
	console.log(unregisteredTextures);

	var PLURALIZER = "s";
	// Retreval Names
	var idMap = {
		id:"Id",
		mascot: "critter",
		spriteSheet:"spriteSheet",
	}
	//Saving Names
	let keyAliases = {
		"items,spriteSheet": "#,items",
		"items": "icons",
		"critters,,spriteSheet":",,#",
		",,background": ",,bg",
		",,foreground": ",,fg",
		",,navMesh": ",,nm",
		",,spriteSheet":",,sprites",
		",,icon":",,#",
		",,f":",,front",
		",,b":",,back",
	}
	let propertyOrder = [
		'series',
		'theme',
		'slot'
	]
	var extentions = {
		texture:".png",
		audio:".mp3",
		html:".html"
	}
	
	/**
	 * @author Sarpnt
	 * @param  {...any} i m,a,p
	 */
function getAlias(...i) {
	var blankChar = "#";
	for (let k in keyAliases) {
		if (k.split(',').find((e, x) => e && e != i[x])) continue;
		let a = keyAliases[k].split(',');
		i = i.map((e, x) => a[x] || e);
	}
	if (i.length>2) i=i.splice(i.length-2,i.length-1)
	return i.filter(e=>e!=blankChar).join('_');
}

function isSpriteSheet(obj,p) {
	return p == "spriteSheet"||

	typeof(obj[p])!="object"&&
	["images","framerate","frames","animations"].reduce((isSpriteSheet,prop)=>isSpriteSheet&&obj[p].hasOwnProperty(prop),true)
}

async function sortManifestList(manifestList,getData) {
	return await Object.keys(manifestList).reduceAsync(async (tp, m) => {
		var mSingular = m[m.length - 1] == PLURALIZER ? m.substr(0, m.length - 1) : m;
		var mTitle = titleize(m);
		var mSingleTitle = titleize(mSingular);
		var mData = await getData(manifestList,m);
		var mAlias = getAlias(m);
		console.debug("== " + mTitle + " ==");

		var mSpriteSheetKeys;

		{
			let spriteTemp
			if(Array.isArray(mData)) {
				spriteSheet = Object.assign(...mData)
				console.debug(spriteSheet)
			} else {

			}
		}
		mSpriteSheetKeys = Object.keys(spriteTemp).filter(key=>isSpriteSheet(spriteTemp,key));
		if (!Array.isArray(mData)) {
			//if(mSpriteSheetKeys.length>1/*mData.spriteSheet*/) {
			//	mData = [mData];
			//}
			if(typeof(Object.values(mData)[0])=="object") {
				mData = Object.keys(mData).map(k => Object.assign({ [mSingular + idMap.id]: k }, mData[k]))
			} else {
				mData = Object.keys(mData).map(k => ({ [mSingular + idMap.id]: k, "texture":mData[k]}))
			}
		}
		//mSpriteSheetKeys = Object.keys(Object.assign(...mData)).filter(key=>isSpriteSheet(mData,key));

		var mTypes = await getObjectSchematic(mData);
		console.debug(mTypes);
		//console.log(assetInfo)
		var mIdKey = (idMap[mSingular] || mSingular) + idMap.id;

		//SeperateSprites
		var mSpritesAlias = getAlias(m,idMap.spriteSheet);
		var mAllSpriteSheets = mSpriteSheetKeys.map(k=>mData.map(a=>a[k])).filter(Boolean);
		var mSpriteSheets = [...new Set(mAllSpriteSheets)];
		if(mSpriteSheets.length != mAllSpriteSheets.length) {
			tp[mSpritesAlias]={};
			for(var i in mSpriteSheets){
				var spriteSheet = mSpriteSheets[i];
				var spriteSheetAlias = getAlias(m,idMap.spriteSheet,spriteSheet.split("/")[3]);
				tp[mSpritesAlias][spriteSheetAlias] = await fillURL(spriteSheet)
			}
		}
		var mIncludeSprites = !tp[mSpritesAlias]

		/**
		 * a Asset Key Name
		 * aData Asset Data
		 * aAlias
		 */
		tp[mAlias] = await mData.reduceAsync(async (tp, aData) => {
			var a = aData[(idMap[mSingular] || mSingular) + idMap.id];
			var aTextureList = {};
			var aAlias = getAlias(m,a);
			console.debug(mSingleTitle + ":", a);

			//Sprite Sheet
			if (mIncludeSprites && aData[spriteSheetKey]) {
				for(var spriteSheetKey in mSpriteSheetKeys) {
					var aSpriteAlias = getAlias(m,spriteSheetKey);
					aTextureList[aSpriteAlias] = await getSprites(aData[spriteSheetKey], a);
				}
			}

			//All textures tp the TP
			for (var p in aData) {
				if (typeof (aData[p]) !== "string")
					continue;
				var pAlias = getAlias(m,a,p);
				for(var ext in extentions)
					if (aData[p].includes(extentions[ext]))
						aTextureList[pAlias] = await fillURL(aData[p]);
			}

			//Cheack for if theres one asset piece
			if (Object.values(aTextureList).length == 1) aTextureList = Object.values(aTextureList)[0];

			//Herarchy setup
			var aHierachyParts = [];
			for (var i in propertyOrder) {
				var parent = aHierachyParts[aHierachyParts.length - 1] || tp;
				var keyName = propertyOrder[i];
				if (aData[keyName]) {
					var key = aData[keyName];
					aHierachyParts[i] = parent[key] || {};
					parent[key] = aHierachyParts[i];
				}
			}
			var placeInHierarchy = aHierachyParts[aHierachyParts.length - 1]||tp;
			placeInHierarchy[aAlias] = aTextureList;
			return tp;
		}, {});

		return tp;
	}, {})
}

	var tp = Object.assign(
		{
			clientscript: await GetClientScript(),
			manifests: await GetManifestLoc(),
		},
		await sortManifestList(manifests,async (list,m)=>{
			return await getAssetInfo(m);
		}),
		await sortManifestList(unregisteredTextures,async (list,m)=>{
			return await requireJson("#data/" + list[m])
		})
	);
	return tp;
}

async function GetTextureList(type) {
	var things = await GetTextureData();
	if (type) things = things[type];
	var tp = explode(things);
	//tp.packVersion = "UNKNOWN";
	return tp;
}

module.exports = {
	getAssetInfo,
	GetClientScript,
	GetManifestLoc,
	GetTextureData,
	GetTextureList
}
