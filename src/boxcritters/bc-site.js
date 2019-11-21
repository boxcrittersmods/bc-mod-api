const request = require("request-promise");
const { JSDOM } = require("jsdom");

const Website = require("#src/util/website");
const Cache = require("#src/util/cache");

var bcWebsite = Website.Connect("https://boxcritters.com/play/index.html");
var bcCache = new Cache();

async function GetVersion() {
	var version = bcCache.get("version");
	if (version == undefined) {
		var pre = "../lib/client";
		var suf = ".min.js";
		var scripts = await bcWebsite.getScripts();

		var script = scripts.find(s => s.src.startsWith(pre));
		var sUrl = script.src;
		version = sUrl.replace(pre, "").replace(suf, "");
		bcCache.set("version", version);
	}
	return version;
}

async function GetManifests() {
	var manifests = bcCache.get("manifests");
	if (manifests == undefined) {
		var scriptfilter = "queue.loadManifest";
		// retrive lines betweeen "queue.loadManifest("
		//                    and "]);"
		var manifestRegex = /(?<=queue.loadManifest\()(.*)(?=\]\)\;)/gms;
		var scripts = await bcWebsite.getScripts();

		var script = scripts.filter(s => s.text.includes(scriptfilter))[0];
		manifests = eval(script.text.match(manifestRegex)[0] + "]");
		bcCache.set("manifests", manifests);
	}
	return manifests;
}
(async () => {
	console.log(await GetManifests())	
})()

async function GetItemsFolder() {
	var itemsfolder = bcCache.get("itemsfolder");
	if (itemsfolder == undefined) {
		var pre = "/media/items/";
		var suf = "/items.json";
		var manifests = await GetManifests();

		var itemsjson = manifests.filter(m => m.id == "items")[0].src;
		itemsfolder = itemsjson.replace(pre, "").replace(suf, "");
		bcCache.set("itemsfolder", itemsfolder);
	}
	return itemsfolder;
}

module.exports = {
	GetVersion,
	GetItemsFolder
};
