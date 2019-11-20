const express = require("express");
const Site = require("#src/util/site.js");
const moment = require('moment');

var router = express.Router();
var versions = [];
/*
date
name
items
*/


var listeners = (function(versions) {
	function newVersion(version) {
		if (versions.map(v=>v.name).includes(version)) return;
		var n = versions.map(v=>v.name)[versions.length-1];
		var i = versions.map(v=>v.items)[versions.length-1];
		var v = {
			date: moment().format('DD-MM-YYYY'),
			name:version,
			items:i
		}
		if(n==undefined) {
			versions[versions.length-1] = v;
			return;
		}
		versions.push(v);

	}

	function newItem(itemfolder) {
		if (versions.map(v=>v.items).includes(itemfolder)) return;
		var n = versions.map(v=>v.name)[versions.length-1];
		var i = versions.map(v=>v.items)[versions.length-1];
		var v = {
			date: moment().format('DD-MM-YYYY'),
			name:n,
			items:itemfolder
		}
		if(i==undefined) {
			versions[versions.length-1] = v;
			return;
		}
		versions.push(v);

	}
	return {
		newVersion,
		newItem
	}
})(versions);
Site.eventHander.addEventListener('newVersion',listeners,listeners.newVersion);
Site.eventHander.addEventListener('newItems',listeners,listeners.newItem);


/**
 * Middleware
 */
router.use(async (req, res, next) => {
	res.type("application/json");
	await Site.GetVersion();
	await Site.GetItemsFolder();
	next();
});

/**
 * Routers
 */
// /versions
router.get("/", (req, res) => {
	res.json(versions.map(v=>v.name)|"LIST VERSIONS");
});
// /versions/latest
router.get("/latest",(req, res) => {
	res.json(versions[versions.length-1]||"LATEST VERSION");
});
// /versions/(version)
router.get("/:ver", (req, res) => {
	res.json("VERSION " + req.params.ver);
});

module.exports = router;