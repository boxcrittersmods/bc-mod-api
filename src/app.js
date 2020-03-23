const express = require("express");
const serveIndex = require('serve-index');
const adminLogin = require('bc-admin-login');

//middleware
const cors = require("cors");

//routers
const versions = require('./routes/versions');
const feedback = require('./routes/feedback');
const corsProxy = require('./routes/cors');
const desc = require('./routes/description');
const items = require('./routes/items');
const manifests = require('./routes/manifests');
const getassets = require('./routes/getassets')
const mod = require('./routes/mod');

//data
const textureData = require('./boxcritters/genasset');
//const textureData = require('#data/texture-data.json');
const sitesData = require('#data/sites.json');

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

//enable CORS
app.use(cors());
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});
/**
 * Routes
 */
app.use('/manifests',manifests);
app.use('/versions',versions);
app.use('/items',items);
app.use(
	"/scripts",
	express.static("public"),
	serveIndex("public", { icons: true })
);
app.use('/cors',corsProxy);
app.use('/mod',mod);

app.use('/description',desc);
app.use('/feedback',feedback);
app.use('/getassets',getassets);

/**
 * Paths
 */
app.get('/textures', async (req,res)=>{
    res.type("application/json");
    var textures = await textureData.GetTextureList();
    res.json(textures);
});
app.get('/texture-data', async (req,res)=>{
    res.type("application/json");
    var textures = await textureData.GetTextureData();
    res.json(textures);
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
