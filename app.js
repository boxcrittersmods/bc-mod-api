const express = require("express");
const assetFolder = require('./assetfolder');
var cors = require('cors');

var app = express();
var ttl = 0;
var api = {};
assetFolder.update().then((data)=>{
    api = data;
});

app.use(cors());

app.use((req,res,next)=>{
    res.type("application/json");
    next();
});

app.use((req,res,next)=>{      
    if(ttl<=0){
        ttl = 1000;
        assetFolder.update().then((data)=>{
            api = data;
            next();
        });
    } else {
        ttl--;
        next();
    }
})

app.get("/",(req,res)=>{
    res.json(api);
});

module.exports = app;