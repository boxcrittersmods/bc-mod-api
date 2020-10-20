"use strict";
const express = require("express");
const bcVersions = require("#src/boxcritters/versions");
//if (process.env.NODE_ENV=='production') require('#src/listeners/versionListener');
let router = express.Router();


/**
 * Middleware
 */
router.use(async (req, res, next) => {
	res.type("application/json");
	///TODO: Find out how clienet version names work
	//await bcVersions.CheckForNewVersion();
	next();
});

/**
 * Routers
 */
// /versions
router.get("/", (req, res) => {
	let list = bcVersions.GetVersions().map(v => v.name);
	res.json(list || "LIST VERSIONS");
});
router.get("/all", (req, res) => {
	let list = bcVersions.GetVersions();
	res.json(list || "LIST VERSIONS");
});
// /versions/latest
router.get("/latest", (req, res) => {
	let version = bcVersions.GetLatest();
	res.json(version || "LATEST VERSION");
});
// /versions/(version)
router.get("/:ver", (req, res) => {
	let version = bcVersions.GetVersion(req.params.ver)[0];
	res.json(version || "VERSION " + req.params.ver);
});

module.exports = router;