"use strict";
const express = require("express");
const BC = require("#src/boxcritters/bc-site.js");
const Assets = require("#src/boxcritters/genasset.js");

let router = express.Router();

/**
 * Routers
 */

router.get('/', async (req, res) => {
	res.type("application/json");
	let manifests = await BC.GetManifests();

	res.json(manifests);

});


router.get('/:type/:name?', async (req, res) => {
	res.type("application/json");
	let manifest = await Assets.getAssetInfo(req.params.type, req.params.name);

	res.json(manifest);

});


module.exports = router;