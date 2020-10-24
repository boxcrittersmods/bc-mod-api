const request = require('request');
const { JSDOM } = require("jsdom");

let bcurl = "https://boxcritters.com/play/index.html";

let scripts = ["client"/*,"items"*/];
let scriptinfo = {
	client: {
		pre: "../lib/client",
		post: ".min.js"
	}/*,
    items:{
        pre: "../lib/items-",
        post: ".js"
    },*/
};

function getSiteText(url) {
	return new Promise((resolve, reject) => {
		request(url, function (error, response, body) {
			//console.log('error:', error); // Print the error if one occurred
			console.log('UPDATED VERSION INFO statusCode:', response && response.statusCode); // Print the response status code if a response was received
			//console.log('body:', body);
			if (error) {
				reject(error);
			}
			resolve(body);
		});
	});
}

function getSiteDocument(sitetext) {
	const { window } = new JSDOM(sitetext);
	let document = window.document;
	return document;
}

function getVerName(document, scriptinfo) {
	let scripts = Array.from(document.scripts);
	let script = scripts.find(s => {
		return s.src.startsWith(scriptinfo.pre);
	});
	let url = script.src;
	let ver = url.replace(scriptinfo.pre, "").replace(scriptinfo.post, "");
	return ver;
}

function getVersionInfo(ver) {
	let info = {};

	info.clientVersion = ver.client;
	info.clientVersionNum = ver.client.split("-")[0] | undefined;
	info.clientVersionName = ver.client.split("-")[1] || undefined;
	//info.itemsVersion = ver.items;
	return info;
}

/*
{
	version => clientVersion
	versionNum => clientVersionNum
	versionName => clientVersionName
	NEW => itemsVersion
	assetsFolder => REMOVED

*/
function updateVersionNames() {
	return new Promise((resolve, reject) => {
		getSiteText(bcurl).then(body => {
			let document = getSiteDocument(body);
			let ver = {
				client: getVerName(document, scriptinfo.client)//,
				//items: getVerName(document,scriptinfo.items)
			};

			resolve(getVersionInfo(ver));
		}).catch(reject);
	});
}


module.exports = {
	update: updateVersionNames
};