const request = require('request-promise');
const { JSDOM } = require("jsdom");
const NodeCache = require("node-cache");

var bcCache = new NodeCache({ stdTTL: 10, checkperiod: 5 });

async function GetDocument(url) {
    var body = await request(url);
    var { window } = new JSDOM(body);
    var document = window.document;
    return document;
}


async function GetVersion() {
	var version = bcCache.get("version");
	if (version == undefined) {
        console.log("update");
		var bcUrl = 'https://boxcritters.com/play/index.html';
		var pre = '../lib/client';
		var suf = '.min.js';

		var document = await GetDocument(bcUrl);
		var scripts = Array.from(document.scripts);
		var script = scripts.find(s => {
			return s.src.startsWith(pre);
		});
		var sUrl = script.src;
        version = sUrl.replace(pre, '').replace(suf, '');
        bcCache.set('version',version);        
    }
    return version;
}


module.exports = {
    GetDocument,
    GetVersion
}