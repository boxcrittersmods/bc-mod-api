"use strict";
const Website = require("#src/util/website");
const Cache = require("#src/util/cache");

let bcManifests = Website.Connect("https://boxcritters.com/play/manifest.json");
let bcCache = new Cache();

async function GetClientScriptURL() {
	return "https://boxcritters.com/lib/client.min.js";
}

String.prototype.log = function (pre) {
	console.log(pre, this);
	return this;
};


String.prototype.replaceAll = function (from, to) {
	return this.split(from).join(to);
};

async function GetManifests() {
	let manifests = bcCache.get("manifests");
	if (manifests == undefined) {
		manifests = (await bcManifests.getJson()).manifest.reduce((manifests, m) => {
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
};
