"use strict";
const BoxCritters = require("./bc-site");
//const bcVersions = require("./versions");
const Website = require('#src/util/website');
const path = require('path');

//data
//const textureDataJson = require('#data/texture-data.json');
const textureMisc = require('#data/misc-textures.json');
const sitesJson = require('#data/sites.json');
const critterballJson = require('#data/critterball.json');
const wikiPagesJson = require('#data/wikiPages.json');

//let SITE_URL = getSiteUrl();

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
		let output = def;
		for (let i in this) {
			output = await action(output, this[i], i);
		}
		return output;
	}
});

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
		let value = obj[key];
		if (typeof (prefix) == "string") key = prefix + "_" + key;
		if (Array.isArray(value)) return Object.assign(pieces, value.reduce((arrObj, item, i) => {
			let suffix = value.length > 1 ? i : "";
			arrObj[key + suffix] = item;
			return arrObj;
		}, {}));
		let p = undefined;
		if (prefix) p = key;
		if (typeof value == "object") return Object.assign(pieces, explode(value, p));
		pieces[key] = value;
		return pieces;
	}, {});
}
function urlIsRoot(url) {
	return url.startsWith("http://") || url.startsWith("https://");
}

function getSiteUrl(site = 'boxcritters') {
	return sitesJson.find(s => s.name == site).url;
}

async function fillURL(url) {
	if (!url || url == "") return "";
	if (!urlIsRoot(url)) {
		console.log("BEFORE:" + url);
		let base = "boxcritters.com/play";
		if (url.startsWith("/")) base = "boxcritters.com";
		url = path.join(base, url);
		url = "https://" + url;
		console.log("AFTER:" + url);
	}
	return url;
}

async function getWikiUrl(thing) {
	let itemName = wikiPagesJson[thing.id] || thing.name;
	if (itemName) return "https://box-critters.fandom.com/wiki/" + itemName.split(" ").join("_");
}

async function getSprites(spriteSheet, name) {
	if (spriteSheet.src) {
		spriteSheet = spriteSheet.src;
	}
	let sprites;
	if (typeof (spriteSheet) == "string" && spriteSheet.includes(".json")) {
		let host = getSiteUrl("boxcritters");
		let url = BoxCritters.CleanURL(spriteSheet);
		let website = Website.Connect(url);
		sprites = await website.getJson();
	} else {
		sprites = spriteSheet;
	}

	return sprites.images.reduceAsync(async (tp, sprite, i) => {
		let value = BoxCritters.CleanURL(sprite);
		let key = name;
		if (sprites.images.length <= 1) {
			return value;
		}
		key += "_" + i;
		tp[key] = value;
		return tp;
	}, {});
}

async function getAssetInfo(type, name) {
	let manifests = await BoxCritters.GetManifests();
	let manifest = manifests[type];
	if (Array.isArray(manifest)) {
		if (typeof name == "undefined") return await Promise.all(manifest.map(m => getAssetInfo(type, m.name)));
		manifest = manifest.find(m => m.name == name);
	}
	let url = BoxCritters.CleanURL(manifest.src);
	console.log(type + ":" + (name ? name + ":" : "") + url);
	let website = Website.Connect(url);
	let assetInfo = await website.getJson();

	async function modifyManifest(thing) {

		//add missing values that used to be there for backewards compatability
		switch (type) {
			case "item":
			case "items":
				thing.id = thing.itemId;
				thing.sprites = "https://boxcritters.com/media/items/" + thing.itemId + "/sprites.png";
				thing.icon_sm = "https://boxcritters.com/media/items/" + thing.itemId + "/icon_sm.png";
				thing.icon = "https://boxcritters.com/media/items/" + thing.itemId + "/icon_md.png";
				thing.icon_lg = "https://boxcritters.com/media/items/" + thing.itemId + "/icon_lg.png";
				thing.textures = "https://api.bcmc.ga/textures/items/" + thing.itemId;
				thing.textures_sprites = "https://api.bcmc.ga/textures/items/" + thing.itemId + "_sprites";
				break;
			case "room":
			case "rooms":
				thing.id = thing.roomId;
				thing.textures = "https://api.bcmc.ga/textures/rooms/rooms_" + thing.roomId;
				break;
			case "critter":
			case "critters":
				thing.id = thing.critterId;
		}
		(thing.id || thing.name) && (thing.wiki = await getWikiUrl(thing));
	}

	//console.log(Object.keys(assetInfo));
	if (Array.isArray(assetInfo))
		for (let thing of assetInfo) {
			await modifyManifest(thing);
		}
	else await modifyManifest(assetInfo);

	return assetInfo;
}

async function GetManifestLoc() {
	let manifests = await BoxCritters.GetManifests();
	console.log("manifests today are as folows", manifests);
	let tp = Object.keys(manifests).reduceAsync(async (tp, m) => {
		console.debug("Manifest: " + m);
		if (!manifests[m]) throw `Manifest ${m} does not exist`;
		tp[m + "_manifest"] = Array.isArray(manifests[m])
			? manifests[m].map(m => BoxCritters.CleanURL(m.src))
			: BoxCritters.CleanURL(manifests[m].src);
		return tp;
	}, {});
	return tp;
}

async function GetCritterBall() {
	let tp = critterballJson;
	return tp;
}

async function getObjectSchematic(obj) {
	obj = JSON.parse(JSON.stringify(obj));
	if (obj == null || obj == undefined) return "null";
	//console.debug("DOCUMENTING OBJECT<" + (Array.isArray(obj) ? ("array" +"("+obj.length+")") : typeof (obj)) + ">:", obj);
	if (Array.isArray(obj)) {
		if (obj.length > 1 && typeof (obj[0]) === "object") {
			obj = Object.assign(...obj);
		} else if (obj.length == 0) {
			return "array";
		} else {
			obj = obj[0];
		}
	}
	if (typeof (obj) === "object") {
		//console.debug(obj);
		let hmm = Object.assign({}, ...await Promise.all(
			Object.keys(obj)
				.map(async k =>
					({ [k]: await getObjectSchematic(obj[k]) })
				))
		);
		return hmm;
	}
	if (typeof (obj) === "string") {
		if (obj.includes('.png'))
			return 'texture';
		if (obj.includes('.json')) {
			return "spriteSheet";
		}
	}
	return typeof (obj);
}
async function GetTextureData() {
	//let symbols = await GetSymbols();

	let manifests = await BoxCritters.GetManifests();


	let PLURALIZER = "s";
	// Retreval Names
	let idMap = {
		id: "Id",
		mascot: "critter",
		spriteSheet: "spriteSheet",
	};
	//Saving Names
	let keyAliases = {
		"items,spriteSheet": "#,items",
		//"items": "icons",
		"critters,,spriteSheet": ",,#",
		",,background": ",,bg",
		",,foreground": ",,fg",
		",,navMesh": ",,nm",
		",,spriteSheet": ",,sprites",
		",,icon": ",,#",
		",,f": ",,front",
		",,b": ",,back",
	};
	let propertyOrder = [
		'series',
		'theme',
		'slot'
	];
	let extentions = {
		texture: ".png",
		audio: ".mp3",
		video: ".mp4"
	};

	/**
	 * @author Sarpnt
	 * @param  {...any} i m,a,p
	 */
	function getAlias(...i) {
		let blankChar = "#";
		for (let k in keyAliases) {
			if (k.split(',').find((e, x) => e && e != i[x])) continue;
			let a = keyAliases[k].split(',');
			i = i.map((e, x) => a[x] || e);
		}
		if (i.length > 2) i = i.splice(i.length - 2, i.length - 1);
		return i.filter(e => e != blankChar).join('_');
	}

	function validURL(str) {
		var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
			'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
			'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
			'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
		return !!pattern.test(str) && str.includes("boxcritters.com");
	}

	async function parseManifest(tp, m, data) {
		let mSingular = m[m.length - 1] == PLURALIZER ? m.substr(0, m.length - 1) : m;
		let mTitle = titleize(m);
		//let mSingleTitle = titleize(mSingular);
		let mData = data || await getAssetInfo(m);
		let mAlias = getAlias(m);
		console.debug("== " + mTitle + " ==");
		if (!Array.isArray(mData)) {
			if (mData.spriteSheet) {
				mData = [mData];
			}
			mData = !mData.spriteSheet ? Object.keys(mData).map(k => Object.assign({ [mSingular + idMap.id]: k }, mData[k])) : [mData];
		}
		//let mTypes = await getObjectSchematic(mData);
		//console.debug(mTypes);
		//console.debug(assetInfo)
		//let mIdKey = (idMap[mSingular] || mSingular) + idMap.id;

		//SeperateSprites
		let mSpritesAlias = getAlias(m, idMap.spriteSheet);//manifestAlias[m + "_sprites"]||m + "_sprites";
		let mAllSpriteSheets = mData.map(a => a.sprites || a.spriteSheet);
		let mSpriteSheets = [...new Set(mAllSpriteSheets)];
		if (mSpriteSheets.length != mAllSpriteSheets.length && !mSpriteSheets.includes(undefined)) {
			tp[mSpritesAlias] = {};
			for (let i in mSpriteSheets) {
				let spriteSheet = mSpriteSheets[i];
				let spriteSheetAlias = getAlias(m, idMap.spriteSheet, spriteSheet.split("/")[3]);
				tp[mSpritesAlias][spriteSheetAlias] = BoxCritters.CleanURL(spriteSheet);
			}
		}
		let mIncludeSprites = !tp[mSpritesAlias];

		/**
		 * a Asset Key Name
		 * aData Asset Data
		 * aAlias
		 */
		let tpManifestParsing = await mData.reduceAsync(async (tp, aData) => {
			let a = aData[(idMap[mSingular] || mSingular) + idMap.id];
			let aTextureList = {};
			let aAlias = getAlias(m, a);
			//console.debug(mSingleTitle + ":", a);

			//Sprite Sheet
			if (mIncludeSprites && aData.spriteSheet) {
				let aSpriteAlias = getAlias(m, a, idMap.spriteSheet);//propertyAlias[a + "_sprites"]||propertyAlias.spriteSheet||"_sprites"
				aTextureList[aSpriteAlias] = await getSprites(aData.spriteSheet, a);
				delete aData.spriteSheet;
			}

			//look though entire array
			function traverse(obj, prop) {
				//console.log(prop, obj);
				//All textures tp the TP
				for (let p in obj) {
					if (typeof obj[p] == "object") traverse(obj[p]);
					if (typeof (obj[p]) !== "string")
						continue;
					if (m == "rooms")
						debugger;
					let pAlias = getAlias(m, a, p);//propertyAlias[p] || "_"+p;
					/*for (let ext in extentions)
						if (obj[p].includes(extentions[ext]))*/
					if (validURL(obj[p]))
						aTextureList[pAlias] = BoxCritters.CleanURL(obj[p]);
				}
			}

			traverse(aData);

			//Cheack for if theres one asset piece
			if (Object.values(aTextureList).length == 1) aTextureList = Object.values(aTextureList)[0];

			//Herarchy setup
			let aHierachyParts = [];
			for (let i in propertyOrder) {
				let parent = aHierachyParts[aHierachyParts.length - 1] || tp;
				let keyName = propertyOrder[i];
				if (aData[keyName]) {
					let key = aData[keyName];
					aHierachyParts[i] = parent[key] || {};
					parent[key] = aHierachyParts[i];
				}
			}
			let placeInHierarchy = aHierachyParts[aHierachyParts.length - 1] || tp;
			placeInHierarchy[aAlias] = aTextureList;
			return tp;
		}, {});
		if (tp[mAlias]) {
			Object.assign(tp[mAlias], tpManifestParsing);
		} else {
			tp[mAlias] = tpManifestParsing;
		}

		return tp;
	}

	let tp = Object.assign(
		{
			misc: textureMisc,
			manifests: await GetManifestLoc(),
		},
		/**
		 * m:			Manifest Name
		 * mSingualer:	Singular name of manifest
		 * mTitle:		Manifest Title
		 * mSingleTitle:	Singular Manifest Title
		 * mData:			Manifest Data
		 * mAlias			Manifest Alternate Name
		 * mTypes			List of AssetProperty Types
		 */
		await Object.keys(manifests).reduceAsync(async (tp, m) => {
			if (Array.isArray(manifests[m])) {
				//TODO
				manifests[m].forEach(async mInfo => {

					let url = BoxCritters.CleanURL(mInfo.src);
					let website = Website.Connect(url);
					let mData = await website.getJson();
					tp = await parseManifest(tp, m, mData);

				});
				return tp;
			} else {
				return parseManifest(tp, m);
			}
		}, {})/*,
		/{
			//shop: await GetShop(),
			critterball: await GetCritterBall()
		}*/
	);
	return tp;
}

async function GetTextureList(type) {
	let things = await GetTextureData();
	if (type) things = things[type];
	let tp = explode(things);
	//tp.packVersion = "UNKNOWN";
	return tp;
}

module.exports = {
	getAssetInfo,
	GetManifestLoc,
	//GetCritters,
	//GetItems,
	//GetIcons,
	GetCritterBall,
	GetTextureData,
	GetTextureList
};
