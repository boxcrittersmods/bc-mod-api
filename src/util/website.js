
const fetch = require('node-fetch')
const { JSDOM } = require("jsdom");

function Website(body) {
	if (!new.target) return;
	if (typeof body === "undefined") {
		throw new Error("Cannot be called directly");
	}
	//var w = this;
	this.body = body;
	//body.then(body => (w.body = body));
}

Website.Connect = function(url,body,method="GET") {
	var body = body?
	async()=>fetch(url,{
		method,
		body:JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
	}):
	async()=>fetch(url);
	var website = new Website(body);
	return website;
};

Website.prototype.getJson = async function () {
	var body = await this.body();
	var json = body.json()
	return json;
}

Website.prototype.getText = async function () {
	var body = await this.body();
	return body.text();
}

Website.prototype.getBuffer = async function() {
	var body = await this.body();
	return body.buffer();	
}

Website.prototype.getDocument = async function() {
	var { window } = new JSDOM(await this.getText());
	var document = window.document;
	return document;
};

Website.prototype.getScripts = async function() {
	var document = await this.getDocument();
	var scripts = Array.from(document.scripts);
	return scripts;
};

module.exports = Website;
