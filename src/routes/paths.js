const express = require("express");
const BC = require("#src/boxcritters/bc-site.js");

var router = express.Router();

/**
 * Routers
 */

router.get('/',async (req,res)=>{
	res.type("application/json");
	var paths = await BC.GetPaths();

	res.json(paths);

})

module.exports = router;