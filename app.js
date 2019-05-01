const express = require("express");
const cors = require('cors');

const apiretrive = require('./api');
const feedback = require('./feedback');
const corsProxy = require('./cors')
const version  = require('./version')

var app = express();
var ttl = 0;
var api = {};
apiretrive.update().then((data)=>{
    api = data;
});


app.set('json spaces', 2);

//middleware
app.use('/scripts',express.static('public'));
app.use(cors());
app.use((req,res,next)=>{
    res.type("application/json");
    next();
});
app.use((req,res,next)=>{      
    if(ttl<=0){
        ttl = 50;
        version.update();
        apiretrive.update().then((data)=>{
            api = data;
            next();
        });
    } else {
        ttl--;
        next();
    }
})

//routers
//app.use('/feedback',feedback);
app.use('/version',version.router);
app.use('/cors',corsProxy);
app.get('/versions/:ver',(req,res)=>{
    res.redirect('/version/git ' + req.params.ver);
});


//routes
app.get('/versions',(req,res)=>{
    res.json(version.getVersions());
});
app.get("/",(req,res)=>{
    res.json(api);
});

module.exports = app;
