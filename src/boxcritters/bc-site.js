"use strict";
const Website = require("#src/util/website");
const Cache = require("#src/util/cache");
const path = require("path");

const SSL = "https://",
	BC_URL = "boxcritters.com",
	BC_PLAY = path.join(BC_URL, "play"),
	BC_LIB = path.join(BC_URL, "lib");

let bcWebsite = Website.Connect(CleanURL("index.html"));
let bcManifests = Website.Connect("https://boxcritters.com/play/manifest.json");
let bcCache = new Cache();

let getPathParts = path => /^.*[\\\/](.*)\.(.*)/.exec(path);

async function GetClientScriptURL() {
	return path.join(SSL + BC_LIB, "client.min.js");
}

function CleanURL(url) {
	if (!url.startsWith("http")) {
		if (url.startsWith("/")) {
			url = SSL + path.join(BC_URL, url);
		} else {
			url = SSL + path.join(BC_PLAY, url);
		}
	}
	return url;
}

async function getScripts() {
	let scripts = await bcWebsite.getScripts();
	return await Promise.all(scripts.map(async s => {
		s.text = await Website.Connect(CleanURL(s.src)).getText();
		return s;
	}));
}
async function getInitScript() {
	let scripts = await getScripts();
	let script = scripts.find(s => s.text.includes("function init() "));
	//console.log("Chosen Script", script.outerHTML);
	return script;
}
let debug = 0;

async function getWorldScript() {
	let scripts = await getScripts();
	let script = scripts.find(s => s.text.includes("BOX CRITTERS CLIENT"));
	console.log("Chosen Script", script.outerHTML);
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
			worldScriptText = worldScript.text;

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
		if (void 0 == bcManifests) {
			let manstart = "world.preload([",
				manend = "]);",
				manifestRegex = getStringBetweenStrings(manstart, manend),
				initScript = await getInitScript(),
				initScriptText = initScript.text;

			var manRaw = ("[" + initScriptText.match(manifestRegex)[0].split(manend)[0] + "]");

			manifests = JSON.parse(manRaw);
		} else {
			manifests = (await bcManifests.getJson()).manifest;
		}
		manifests = manifests.reduce((manifests, m) => {
			m.manifests = "https://api.bcmc.ga/manifests/" + m.id;
			m.textures = "https://api.bcmc.ga/textures/" + m.id;
			m.src = CleanURL(m.src);


			if (manifests[m.id]) {
				if (!Array.isArray(manifests[m.id])) {
					manifests[m.id] = [manifests[m.id]];
					for (let mi of manifests[m.id]) {
						if (void 0 == mi.name) mi.name = getPathParts(mi.src)[1];
						mi.manifests += "/" + mi.name;
						mi.textures += "/" + mi.name;
					}
				}
				if (void 0 == m.name) m.name = getPathParts(m.src)[1];
				m.manifests += "/" + m.name;
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
	CleanURL,
	GetManifests,
	GetLayers,
	ClearCache
};
