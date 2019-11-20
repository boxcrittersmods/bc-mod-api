const express = require("express");
const Site = require("#src/util/site.js");

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
	res.write(await Site.GetItemsFolder());
});

module.exports = router;