"use strict";
const fetch = require('node-fetch'),
	bent = require("bent"),
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
	return textl;
};

Website.prototype.getJson = async function () {
	let json = await getJSON(this.url);
	return json;
};

Website.prototype.getBuffer = async function () {
	let buffer = await getBuffer(this.url);
	return buffer;
};

Website.prototype.getDocument = async function () {
	let { window } = void 0 != this.url ? new JSDOM(await this.getText()) : JSDOM.fromURL(this.url);
	let document = window.document;
	return document;
};

Website.prototype.getScripts = async function () {
	let document = await this.getDocument();
	let scripts = Array.from(document.scripts);
	return scripts;
};

module.exports = Website;
