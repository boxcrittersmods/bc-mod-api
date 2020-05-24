const express = require("express");
const serveIndex = require('serve-index');
const adminLogin = require('bc-admin-login');
const io = require("socket.io");

//middleware
const cors = require("cors");

//routers

/*
 * START Broken
 * const versions = require('./routes/versions');
 * const desc = require('./routes/description');
 * const items = require('./routes/items');
 * const manifests = require('./routes/manifests');
 * const paths = require('./routes/paths');
 * const textures = require('./routes/textures');
 * const getassets = require('./routes/getassets');
 * END Broken
 */

const feedback = require("./routes/feedback");
const corsProxy = require("./routes/cors");
const button = require("./routes/button");
const submit = require("./routes/submit");
const approve = require("./routes/approve");
const apply = require("./routes/apply");


//data
const sitesData = require('#data/sites.json');

var app = express();
var server;

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
/*
 * START Broken
 * app.use('/manifests',manifests);
 * app.use('/paths',paths);
 * app.use('/versions',versions);
 * app.use('/items',items);
 * app.use('/textures',textures)
 * app.use('/description',desc);
 * END Broken
 */
app.use(
	"/scripts",
	express.static("public"),
	serveIndex("public", {
		icons: true
	})
);
app.use("/cors", corsProxy);
app.use("/feedback", feedback);
app.use("/button", button);
app.use("/modsubmit", submit);
app.use("/modapprove", approve);
app.use("/applymod", apply);

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

app.all('*',(req,res)=>{
	res.status(404).send({
		"err": "404 - Not found."
	});
});

module.exports = app;
