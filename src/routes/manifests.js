const express = require("express");
const BC = require("#src/boxcritters/bc-site.js");
const Assets = require("#src/boxcritters/genasset.js");

var router = express.Router();

/**
 * Routers
 */

router.get('/',async (req,res)=>{
	res.type("application/json");
	var manifests = await BC.GetManifests();

	res.json(manifests);

})


router.get('/:type',async (req,res)=>{
	res.type("application/json");
	var manifest = await Assets.getAssetInfo(req.params.type)

	res.json(manifest);

})


module.exports = router;