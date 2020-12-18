"use strict";
const Website = require("#src/util/website");
const Cache = require("#src/util/cache");
const path = require("path");


let bcWebsite = Website.Connect("https://boxcritters.com/play");
//let bcManifests = Website.Connect("https://boxcritters.com/play/manifest.json");
let bcCache = new Cache();

let getPathParts = path => /^.*[\\\/](.*)\.(.*)/.exec(path);

async function GetClientScriptURL() {
	return "https://boxcritters.com/lib/client.min.js";
}

async function getScripts() {
	//console.log("Play Page", await bcWebsite.getText());
	let scripts = await bcWebsite.getScripts();
	//console.log("Script URLs", scripts.map(s => s.src));

	return scripts;
}
async function getInitScript() {
	let pre = "play-";
	let scripts = await getScripts();
	let script = scripts.find(s => s.src.startsWith(pre) || s.text.includes("world.preload"));
	//console.log("Chosen Script", script.outerHTML);
	//return "https://boxcritters.com/play/" + script.src;
	return script;
}

async function getWorldScript() {
	let pre = "../lib/world-";
	let scripts = await getScripts();
	let script = scripts.find(s => s.src.startsWith(pre) || s.text.includes("BOX CRITTERS CLIENT"));
	//console.log("Chosen Script", script.outerHTML);
	//return "https://boxcritters.com/play/" + script.src;
	return script;
}

String.prototype.log = function (pre) {
	console.log(pre, this);
	return this;
};


String.prototype.replaceAll = function (from, to) {
	return this.split(from).join(to);
};

function getStringBetweenStrings(a, b) {
	function escapeRegExp(string) {
		return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string	
	}
	a = escapeRegExp(a);
	b = escapeRegExp(b);
	let r = `/(?<=${a})(.*)(?=${b})/ms`;
	return eval(r);

}

function ClearCache() {
	bcCache.clear();
}

async function GetLayers() {
	let layers = bcCache.get("layers");
	if (layers == undefined) {
		let layersRegex = /this\.forward=\[(this(?:.[a-zA-Z]+)+)(?:,\1)*\]/,
			worldScript = await getWorldScript(),
			worldScriptText = "";
		if (worldScript.src == "") {
			worldScriptText = worldScript.text;
		} else {
			worldScript.src = path.join(bcWebsite.url, worldScript.src);
			//console.log("World script url ", worldScript.src);
			let worldScriptFile = Website.Connect(worldScript.src);
			worldScriptText = await worldScriptFile.getText();
		}

		layers = layersRegex.exec(worldScriptText)[1].replace(/this\./g, "").split(",");
		layers.unshift("feet");
		console.log(layers);
		//console.log("world script content", worldScriptText);
		bcCache.set("layers", layers);
	}
	return layers;

}


async function GetManifests() {
	let manifests = bcCache.get("manifests");
	if (manifests == undefined) {
		let manstart = "world.preload([",
			manend = "]);",
			manifestRegex = getStringBetweenStrings(manstart, manend),
			initScript = await getInitScript(),
			initScriptText = "";
		if (initScript.src == "") {
			initScriptText = initScript.text;
		} else {
			//console.log("Init script url ", initScript.src);
			let initScriptFile = Website.Connect(initScript.src);
			initScriptText = await initScriptFile.getText();
		}
		//console.log("init script content", initScriptText);

		var manRaw = ("[" + initScriptText.match(manifestRegex)[0].split(manend)[0] + "]");

		manifests = JSON.parse(manRaw);

		//manifests = (await bcManifests.getJson()).manifest;
		manifests = manifests.reduce((manifests, m) => {
			m.mod_api = "https://api.boxcrittersmods.ga/manifests/" + m.id;
			m.textures = "https://api.boxcrittersmods.ga/textures/" + m.id;
			if (manifests[m.id]) {
				if (!Array.isArray(manifests[m.id])) {
					manifests[m.id] = [manifests[m.id]];
					for (let mi of manifests[m.id]) {
						mi.name = getPathParts(mi.src)[1];
						mi.mod_api += "/" + mi.name;
						mi.textures += "/" + mi.name;
					}
				}
				m.name = getPathParts(m.src)[1];
				m.mod_api += "/" + m.name;
				m.textures += "/" + m.name;
				manifests[m.id].push(m);
			} else {
				manifests[m.id] = m;
			}
			return manifests;
		}, {});

		bcCache.set("manifests", manifests);
	}
	return manifests;
}
(async () => {
	await GetManifests();
})();

module.exports = {
	GetManifests,
	GetLayers,
	ClearCache
};
