"use strict";
const express = require("express");
const serveIndex = require('serve-index');
const adminLogin = require('bc-admin-login');

//middleware
const cors = require("cors");

//routers

/*
 * START Broken
 */
const versions = require('./routes/versions');
/*
 * const desc = require('./routes/description');
 * const items = require('./routes/items');
 */
const manifests = require('./routes/manifests');
/*
 * const paths = require('./routes/paths');
 */
const textures = require('./routes/textures');
/*
 * const getassets = require('./routes/getassets');
 * END Broken
 */

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

//data
const sitesData = require('#data/sites.json');

let app = express();
app.use(async (req, res, next) => {
	console.log("__**" + [req.method, req.path].join(" ") + "**__");
	next();
});

//Setup Admin login for boxcrittersmods.ga
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
/*
 * START Broken
 */
app.use('/manifests', manifests);
/*
 * app.use('/paths',paths);
 */
app.use('/versions', versions);
/*
 * app.use('/items',items);
 */
app.use('/textures', textures);
/*
 * app.use('/description',desc);
 * END Broken
 */
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
app.use("/itemcodes", database);
/**
 * Paths
 */
/*
START Broken
app.get('/sites',(req,res)=>{
	res.type("application/json");
	res.json(sitesData);
});

app.get('/',(req,res)=>{
	res.type("application/json");
	res.redirect('/versions/latest')
});
END Broken
*/
app.use(
	"/",
	express.static("public"),
	serveIndex("public", {
		icons: true
	})
);

app.all('*', (req, res) => {
	res.status(404).send({
		"err": "404 - Not found."
	});
});

module.exports = app;
