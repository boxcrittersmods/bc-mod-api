const express = require("express");
const serveIndex = require('serve-index');
const adminLogin = require('bc-admin-login');

//routers
const versions = require('./versions');
const feedback = require('./feedback');
const corsProxy = require('./cors');
const desc = require('./description');

//data
const textureData = require(global.config.json.textureData);
const sitesData = require(global.config.json.sites);

var app = express();

//Setup Admin login for boxcritters.github.io
app.use(adminLogin);

/**
 * Settings
 */
app.set("json spaces", 2);

/**
 * Middleware
 */

/**
 * Routers
 */
app.use(
	"/scripts",
	express.static("public"),
	serveIndex("public", { icons: true })
);
app.use('/cors',corsProxy);

app.use('/description',desc);
app.use('/feedback',feedback);

/**
 * Paths
 */
app.get('/texture-data',(req,res)=>{
    res.type("application/json");
    res.json(textureData);
});
app.get('/sites',(req,res)=>{
    res.type("application/json");
    res.json(sitesData);
});

module.exports = app;
