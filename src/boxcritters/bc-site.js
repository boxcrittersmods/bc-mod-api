"use strict";
const Website = require("#src/util/website");
const Cache = require("#src/util/cache");


let bcWebsite = Website.Connect("https://boxcritters.com/play/index.html");
let bcManifests = Website.Connect("https://boxcritters.com/play/manifest.json");
let bcCache = new Cache();

async function GetClientScriptURL() {
	return "https://boxcritters.com/lib/client.min.js";
}

async function getInitScript() {
	console.log("Play Page", await bcWebsite.getText());
	let pre = "play-";
	let scripts = await bcWebsite.getScripts();
	console.log("Script URLs", scripts.map(s => s.src));
	let script = scripts.find(s => s.src.startsWith(pre) || s.text.includes("world.preload"));
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
			console.log("Init script url ", initScript.src);
			let initScriptFile = Website.Connect(initScript.src);
			initScriptText = await initScriptFile.getText();
		}
		console.log("init script content", initScriptText);

		var manRaw = ("[" + initScriptText.match(manifestRegex)[0].split(manend)[0] + "]");

		manifests = JSON.parse(manRaw);

		//manifests = (await bcManifests.getJson()).manifest;
		manifests = manifests.reduce((manifests, m) => {
			if (manifests[m.id]) {
				if (!Array.isArray(manifests[m.id])) {
					manifests[m.id] = [manifests[m.id]];
				}
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
	ClearCache
};
