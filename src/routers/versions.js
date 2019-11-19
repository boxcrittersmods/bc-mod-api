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
router.get("/", (req, res) => {
	res.write("LIST VERSIONS");
});
// /versions/latest
router.get("/latest",async (req, res) => {
	res.json(await Site.GetVersion());
});
// /versions/(version)
router.get("/:ver", (req, res) => {
	res.write("VERSION " + req.params.ver);
});

module.exports = router;
