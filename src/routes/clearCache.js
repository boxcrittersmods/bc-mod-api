


"use strict";
const express = require("express");
const BC = require("#src/boxcritters/bc-site.js");

let router = express.Router();

/**
 * Routers
 */

router.get('/', async (req, res) => {

	BC.ClearCache();

	res.send("Cache Cleared");

});


module.exports = router;