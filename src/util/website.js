"use strict";
const bent = require("bent"),
	getText = bent("string"),
	getJSON = bent("json"),
	getBuffer = bent("buffer"),
	{ JSDOM } = require("jsdom");

function Website(url) {
	if (!new.target) return;
	if (url === "undefined") {
		throw new Error("URL is not defined");
	}
	this.url = url;
}

Website.Connect = function (url, body, method) {
	if (body) throw new Error("There is use of the body param");
	if (method) throw new Error("There is use of the method param");
	return new Website(url);
};

Website.prototype.getText = async function () {
	let text = await getText(this.url);
	return text;
};

Website.prototype.getJson = async function () {
	let json = {};
	try {
		json = await getJSON(this.url);
	} catch (e) { console.error(this.url + " " + e.message); }
	return json;
};

Website.prototype.getBuffer = async function () {
	let buffer = await getBuffer(this.url);
	return buffer;
};

Website.prototype.getDocument = async function () {
	let { window } = await JSDOM.fromURL(this.url) || new JSDOM(await this.getText());
	return window.document;
};

Website.prototype.getScripts = async function () {
	let document = await this.getDocument();
	let scripts = Array.from(document.scripts);
	return scripts;
};

module.exports = Website;
