"use strict"
const Website = require("#src/util/website");
const Cache = require("#src/util/cache");

let bcWebsite = Website.Connect("https://boxcritters.com/play");
let bcInitScript = Website.Connect("https://boxcritters.com/play/index.js");
let bcManifests = Website.Connect("https://boxcritters.com/play/manifest.json");
let bcCache = new Cache();

async function GetClientScriptURL() {
	/*let pre = "/lib/client";
	let scripts = await bcWebsite.getScripts();
	let script = scripts.find(s => s.src.startsWith(pre));*/
	return "https://boxcritters.com/lib/client.min.js";
}

/*async function GetVersion() {
	let version = bcCache.get("version");
	if (version == undefined) {
		let pre = "lib/client";
		let suf = ".min.js";
		let scripts = await bcWebsite.getScripts();

		let script = scripts.find(s => s.src.startsWith(pre));
		let sUrl = script.src;
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
	let r = `/(?<=${a})(.*)(?=${b})/ms`;
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
	let paths = bcCache.get("paths");
	if (paths == undefined) {
		let pathstart = 'if (location.hostname === "boxcritters.com") {';
		let pathend = "} else {";
		let pathRegex = getStringBetweenStrings(pathstart,pathend)
		let scripts = await bcWebsite.getScripts();
		let script = scripts.filter(s => s.text.includes(pathstart))[0];
		
		let pathsRaw = ("{"+script.text.match(pathRegex)[0].split(pathend)[0]+"}")//.log(1)
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
	let manifests = bcCache.get("manifests");
	if (manifests == undefined) {
		manifests = (await bcManifests.getJson()).manifest.reduce((manifests,m)=>{
			if(manifests[m.id]) {
				if(!Array.isArray(manifests[m.id])) {
					manifests[m.id] = [manifests[m.id]];
				}
				manifests[m.id].push(m);
			} else {
				manifests[m.id] = m;
			}
			return manifests;
		},{});
		
		bcCache.set("manifests", manifests);
	}
	return manifests;
}
(async () => {
	console.debug(await GetManifests())	
})()
/*
async function GetItemsFolder() {
	let itemsfolder = bcCache.get("itemsfolder");
	if (itemsfolder == undefined) {
		let pre = "/media/items/";
		let suf = "/items.json";
		let manifests = await GetManifests();

		let itemsjson = manifests["items"];
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
