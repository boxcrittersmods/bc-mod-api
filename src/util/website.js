const request = require("request-promise");
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

Website.Connect = function(url) {
	var body = async () =>request(url);
	var website = new Website(body);
	return website;
};

Website.prototype.getJson = async function () {
	var json = JSON.parse(await this.body());
	return json;
}

Website.prototype.getText = async function () {
	return await this.body();
}

Website.prototype.getDocument = async function() {
	var { window } = new JSDOM(await this.body());
	var document = window.document;
	return document;
};

Website.prototype.getScripts = async function() {
	var document = await this.getDocument();
	var scripts = Array.from(document.scripts);
	return scripts;
};

module.exports = Website;
