const express = require("express");
const bcVersions = require("#src/boxcritters/versions");

var router = express.Router();


/**
 * Middleware
 */
router.use(async (req, res, next) => {
	res.type("application/json");
	await bcVersions.CheckForNewVersion();
	next();
});

/**
 * Routers
 */
// /versions
router.get("/", (req, res) => {
	res.json("LIST VERSIONS");
});
// /versions/latest
router.get("/latest",(req, res) => {
	res.json(bcVersions.GetLatest()||"LATEST VERSION");
});
// /versions/(version)
router.get("/:ver", (req, res) => {
	res.json(bcVersions.GetVersion(req.params.ver)[0]||"VERSION " + req.params.ver);
});

module.exports = router;