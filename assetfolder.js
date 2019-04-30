const request = require('request');
const { JSDOM } = require("jsdom");

var bcurl = "https://boxcritters.com/play/index.html";

var scriptpre = "../scripts/client";
var scriptpost = ".min.js"
var mediastart = "https://boxcritters.com/media/";

function getSiteText(url) {
    return new Promise((resolve,reject)=>{
        request(url, function (error, response, body) {
            //console.log('error:', error); // Print the error if one occurred
            //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            //console.log('body:', body);
            if(error){
                reject(error);
            }
            resolve(body);
        });
    });
}

function getSiteDocument(sitetext) {
    const { window } = new JSDOM(sitetext);
    var document = window.document;
    return document;
}

function getVerName(document){
    var scripts = Array.from(document.scripts);
    var script = scripts.find(s=>{
        return s.src.startsWith('../');
    })
    var url = script.src;
    var ver = url.replace(scriptpre,"").replace(scriptpost,"");
    return ver;
}

function getVersionInfo(ver) {
    var info = {};
    var folder = mediastart + ver + "/";

    info.assetsFolder = folder;
    info.version = ver;
    info.versionNum = ver.split("-")[0];
    info.versionName = ver.split("-")[1];
    return info;
}

function updateAssetsFolder() {
    return new Promise((resolve,reject)=>{
        getSiteText(bcurl).then(body=>{
            var document = getSiteDocument(body);
            var ver = getVerName(document);
            
            resolve(getVersionInfo(ver));
        }).catch(reject);
    });
}


module.exports = {
    update: updateAssetsFolder,
    getVersionInfo
}