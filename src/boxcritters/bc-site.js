const request = require("request-promise");
const { JSDOM } = require("jsdom");

const Website = require("#src/util/website");
const Cache = require("#src/util/cache");

var bcWebsite = Website.Connect("https://boxcritters.com/play/index.html");
var bcCache = new Cache();

async function GetClientScriptURL() {
	var pre = "../lib/client";
	var scripts = await bcWebsite.getScripts();
	var script = scripts.find(s => s.src.startsWith(pre));
	return script.src;

}

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

function getStringBetweenStrings(a,b) {
	function escapeRegExp(string) {
		return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
	  }
	a=escapeRegExp(a);
	b=escapeRegExp(b);
	var r = `/(?<=${a})(.*)(?=${b})/ms`;
	return eval(r);

}

async function GetManifests() {
	var manifests = bcCache.get("manifests");
	if (manifests == undefined) {
		var manstart = "var world = new World('stage', {";
		var manend = "});";
		var manifestRegex = getStringBetweenStrings(manstart,manend)
		var scripts = await bcWebsite.getScripts();
		var script = scripts.filter(s => s.text.includes(manstart))[0];
		
		var manRaw = ("{"+script.text.match(manifestRegex)[0].split(manend)[0]+"}")
		.replace(/\s+/gm," ")
		.replace(/(?<=[{,] )\w+/gms,"'$&'")
		.replace(/'/g,'"');
		manifests = JSON.parse(manRaw);
		delete manifests.lobby;
		
		bcCache.set("manifests", manifests);
	}
	return manifests;
}
(async () => {
	//console.log(await GetManifests())	
})()

async function GetItemsFolder() {
	var itemsfolder = bcCache.get("itemsfolder");
	if (itemsfolder == undefined) {
		var pre = "/media/items/";
		var suf = "/items.json";
		var manifests = await GetManifests();

		var itemsjson = manifests["items"];
		itemsfolder = itemsjson.replace(pre, "").replace(suf, "");
		bcCache.set("itemsfolder", itemsfolder);
	}
	return itemsfolder;
}

module.exports = {
	GetManifests,
	GetVersion,
	GetClientScriptURL
	//GetItemsFolder
};
