const express = require("express");
const serveIndex = require('serve-index');
const adminLogin = require('bc-admin-login');

//routers
const versions = require('./routes/versions');
const feedback = require('./routes/feedback');
const corsProxy = require('./routes/cors');
const desc = require('./routes/description');
const items = require('./routes/items');

//data
const textureData = require('#data/texture-data.json');
const sitesData = require('#data/sites.json');

var app = express();

//Setup Admin login for boxcritters.github.io
app.use(adminLogin);

/**
 * Settings
 */
app.set("json spaces", 2);
/**
 * Routes
 */
app.use('/versions',versions);
app.use('/items',items);
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

app.get('/',(req,res)=>{
    res.type("application/json");
    res.redirect('/versions/latest')
});
app.all('*',(req,res)=>{
    res.status(404).send({msg:'not found'});
})

module.exports = app;
