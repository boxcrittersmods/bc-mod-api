const request = require("request-promise");
const { JSDOM } = require("jsdom");
const Cache = require("./cache");
const EventHandler = require('./events')

var bcCache = new Cache();
var bcEvents = new EventHandler();
var lastVersion;
var lastItem;
/*
Events:
newVersion
*/

async function GetDocument() {
	var url = "https://boxcritters.com/play/index.html";
	var body = await request(url);
	var { window } = new JSDOM(body);
	var document = window.document;
	return document;
}

async function GetScripts() {
    var document = await GetDocument();
    var scripts = Array.from(document.scripts);
	return scripts;
}

async function GetVersion() {
	var version = bcCache.get("version");
	if (version == undefined) {
		var pre = "../lib/client";
		var suf = ".min.js";
		var scripts = await GetScripts();

		var script = scripts.find(s => s.src.startsWith(pre));
		var sUrl = script.src;
        version = sUrl.replace(pre, "").replace(suf, "");
        if(lastVersion!== version) {
            console.log("NEW VERSION",version);
            bcEvents.dispatchEvent("newVersion",version);
        }
        lastVersion = version;
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
		var scripts = await GetScripts();

        var script = scripts.filter(s=>s.text.includes(scriptfilter))[0];
		manifests = eval(script.text.match(manifestRegex)[0] + "]");
		bcCache.set("manifests", manifests);
	}
	return manifests;
}

async function GetItemsFolder() {
	var itemsfolder = bcCache.get("itemsfolder");
	if (itemsfolder == undefined) {
		var pre = "/media/items/";
		var suf = "/items.json";
		var manifests = await GetManifests();

		var itemsjson = manifests.filter(m => m.id == "items")[0].src;
        itemsfolder = itemsjson.replace(pre, "").replace(suf, "");
        
        if(lastItem!== itemsfolder) {
            console.log("NEW ITEMS",itemsfolder);
            bcEvents.dispatchEvent("newItems",itemsfolder);
        }
        lastItem = itemsfolder;
		bcCache.set("itemsfolder", itemsfolder);
	}
	return itemsfolder;
}

module.exports = {
    eventHander:bcEvents,
    GetVersion,
    GetItemsFolder
};
