const express = require("express");
const apiretrive = require('./api');
var cors = require('cors');

var app = express();
var ttl = 0;
var api = {};
apiretrive.update().then((data)=>{
    api = data;
});

app.use(cors());

app.use((req,res,next)=>{
    res.type("application/json");
    next();
});

app.use((req,res,next)=>{      
    if(ttl<=0){
        ttl = 50;
        apiretrive.update().then((data)=>{
            api = data;
            next();
        });
    } else {
        ttl--;
        next();
    }
})

app.set('json spaces', 2);

app.use('/scripts',express.static('public'));

app.get("/",(req,res)=>{
    res.json(api);
});

module.exports = app;
