const express = require("express");
const BC = require("#src/boxcritters/bc-site.js");

var router = express.Router();


/**
 * Middleware
 */
router.use((req, res, next) => {
	res.type("application/json");
	next();
});

/**
 * Routers
 */
// /versions
router.get("/", async (req, res) => {
	res.write(await BC.GetItemsFolder());
});

module.exports = router;