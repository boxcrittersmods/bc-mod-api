const express = require("express");
const github = require('./github');
const assetFolder = require('./assetfolder');
const moment = require('moment');

var versions = [];
var sha = "";
var setupDone = false;
var tosave = false;
var error = {
    "error":"Version does not exist"
}

function update() {
    setupDone = false;
    versions = [];
    github.loadVersions().then(({vers,psha})=>{
        versions.unshift(...vers);
        sha = psha;
        setupDone = true;
        if(tosave) {
            github.saveVersions(vers,sha);
        }
    });
}

function addVersion(version) {
    var ver = {
        name:version,
        description: "",
        date: moment().format('DD-MM-YYYY')
    };
    versions.push(ver);
    if(setupDone) {
        github.saveVersions(versions,sha);
    } else {
        tosave = true;
    }
        
}

function versionExists(ver) {
    return versions.map(v=>v.name.toLowerCase()).indexOf(ver.toLowerCase()) >-1;
}

function getDescription(ver) {
    var id = versions.map(v=>v.name.toLowerCase()).indexOf(ver.toLowerCase());
    if(id>-1){
    var desc = versions[id].description;
    return desc;
    }
}

function getVersions() {
    return versions.map(v=>v.name)
}

var router = express.Router();

router.get('/',(req,res)=>{
    res.redirect('/versions');
});

router.get('/forcesave',(req,res)=>{
    github.saveVersions(versions,sha);
    res.json({done:true});
})

router.get('/:ver',(req,res)=>{
    var ver = req.params.ver;
    if(versionExists(ver)) {
        var info = assetFolder.getVersionInfo(ver);
        info.description = getDescription(ver);
        res.json(info);
    } else {
        res.json(error);
    }
});


module.exports = {
    router,
    addVersion,
    getDescription,
    getVersions,
    update
};
