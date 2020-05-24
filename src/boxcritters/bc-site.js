const request = require("request-promise");
const { JSDOM } = require("jsdom");

const Website = require("#src/util/website");
const Cache = require("#src/util/cache");

var bcWebsite = Website.Connect("https://play.boxcritters.com/");
var bcInitScript = Website.Connect("https://play.boxcritters.com/index.js");
var bcCache = new Cache();

async function GetClientScriptURL() {
	/*var pre = "/lib/client";
	var scripts = await bcWebsite.getScripts();
	var script = scripts.find(s => s.src.startsWith(pre));*/
	return "https://play.boxcritters.com/lib/client.min.js";
}

/*async function GetVersion() {
	var version = bcCache.get("version");
	if (version == undefined) {
		var pre = "lib/client";
		var suf = ".min.js";
		var scripts = await bcWebsite.getScripts();

		var script = scripts.find(s => s.src.startsWith(pre));
		var sUrl = script.src;
		version = sUrl.replace(pre, "").replace(suf, "");
		bcCache.set("version", version);
	}
	return version;
}*/

function getStringBetweenStrings(a,b) {
	function escapeRegExp(string) {
		return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
	  }
	a=escapeRegExp(a);
	b=escapeRegExp(b);
	var r = `/(?<=${a})(.*)(?=${b})/ms`;
	return eval(r);

}

String.prototype.log = function (pre) {
	console.log(pre,this);
	return this;
}


String.prototype.replaceAll = function (from,to) {
	return this.split(from).join(to)
}

/*async function GetPaths() {
	var paths = bcCache.get("paths");
	if (paths == undefined) {
		var pathstart = 'if (location.hostname === "boxcritters.com") {';
		var pathend = "} else {";
		var pathRegex = getStringBetweenStrings(pathstart,pathend)
		var scripts = await bcWebsite.getScripts();
		var script = scripts.filter(s => s.text.includes(pathstart))[0];
		
		var pathsRaw = ("{"+script.text.match(pathRegex)[0].split(pathend)[0]+"}")//.log(1)
		.replaceAll("=",":").split(";");
		pathsRaw = (pathsRaw.slice(0,-1).join(',') + '' + pathsRaw.slice(-1))
		.replace(/\s+/gm," ")//.log("3")
		.replace(/(?<=[{,] )\w+/gms,"'$&'")//.log("4")
		.replace(/'/g,'"')//.log("5")
		paths= JSON.parse(pathsRaw);
		
		bcCache.set("paths", paths);
	}
	return paths;

}*/

async function GetManifests() {
	var manifests = bcCache.get("manifests");
	if (manifests == undefined) {
		var manstart = "world.loadManifest([";
		var manend = "]);";
		var manifestRegex = getStringBetweenStrings(manstart,manend)
		var script = await bcInitScript.getText();
		
		var manRaw = ("["+script.match(manifestRegex)[0].split(manend)[0]+"]")
		.replace(/\s+/gm," ")
		.replace(/\w+(?=:)/gms,"'$&'")
		.replace(/'/g,'"')
		manifests = JSON.parse(manRaw).reduce((manifests,m)=>{
			manifests[m.id] = m.src;
			return manifests;
		},{});
		delete manifests.lobby;
		
		bcCache.set("manifests", manifests);
	}
	return manifests;
}
(async () => {
	console.log(await GetManifests())	
})()
/*
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
}*/

module.exports = {
	GetManifests,
	/*GetPaths,
	GetVersion,*/
	GetClientScriptURL
	//GetItemsFolder
};
