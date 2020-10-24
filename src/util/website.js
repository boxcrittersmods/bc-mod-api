"use strict";
const fetch = require('node-fetch');
const { JSDOM } = require("jsdom");

function Website(body) {
	if (!new.target) return;
	if (typeof body === "undefined") {
		throw new Error("Cannot be called directly");
	}
	//let w = this;
	this.body = body;
	//body.then(body => (w.body = body));
}

Website.Connect = function (url, body, method = "GET") {
	body = body ?
		async () => fetch(url, {
			method,
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json' }
		}) :
		async () => fetch(url);
	let website = new Website(body);
	return website;
};

Website.prototype.getJson = async function () {
	let body = await this.body();
	let json = body.json();
	return json;
};

Website.prototype.getText = async function () {
	let body = await this.body();
	return body.text();
};

Website.prototype.getBuffer = async function () {
	let body = await this.body();
	return body.buffer();
};

Website.prototype.getDocument = async function () {
	let { window } = new JSDOM(await this.getText());
	let document = window.document;
	return document;
};

Website.prototype.getScripts = async function () {
	let document = await this.getDocument();
	let scripts = Array.from(document.scripts);
	return scripts;
};

module.exports = Website;
