"use strict";
const express = require("express");
const serveIndex = require('serve-index');
const adminLogin = require('bc-admin-login');

//middleware
const cors = require("cors");

//routers
const versions = require('./routes/versions');
const manifests = require('./routes/manifests');
const textures = require('./routes/textures');
const feedback = require("./routes/feedback");
const corsProxy = require("./routes/cors");
const button = require("./routes/button");
const submit = require("./routes/submit");
const approve = require("./routes/approve");
const apply = require("./routes/apply");
const compose = require('./routes/compose');
const room = require('./routes/room');
const player = require('./routes/player');
const gear = require('./routes/gear');
const database = require('./routes/database');
const itemcodes = require('./routes/itemcodes');
const shop = require('./routes/shop');
const clearCache = require('./routes/clearCache');

//data
const sitesData = require('#data/sites.json');

let app = express();
app.use(async (req, res, next) => {
	console.log("__**" + [req.method, req.path].join(" ") + "**__");
	next();
});

//Setup Admin login for bcmc.ga
app.use(adminLogin);

/**
 * Settings
 */
app.set("json spaces", 2);
/**
 * Middleware
 */

//enable CORS
app.use(cors());
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});

app.use(function (err, req, res, next) {
	if (!err) next();
	console.error(err.stack);
	res.status(500).send(err.stack);
});
/**
 * Routes
 */
app.use('/manifests', manifests);
app.use('/versions', versions);
app.use('/textures', textures);
app.use("/cors", corsProxy);
app.use("/feedback", feedback);
app.use("/button", button);
app.use("/modsubmit", submit);
app.use("/modapprove", approve);
app.use("/applymod", apply);
app.use("/compose", compose);
app.use("/room", room);
app.use("/player", player);
app.use("/gear", gear);
app.use("/database", database);
app.use("/itemcodes", itemcodes);
app.use("/shop", shop);
app.use("/clear-cache", clearCache);
/**
 * Paths
 */
app.use(
	"/",
	express.static("public"),
	serveIndex("public", {
		icons: true
	})
);
app.use('/favicon.ico', (req, res) => {
	res.redirect("https://res.bcmc.ga/favicon.ico");
});

app.all('*', (req, res) => {
	res.status(404).send({
		"err": "404 - Not found."
	});
});

module.exports = app;
