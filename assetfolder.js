const request = require('request');
const { JSDOM } = require("jsdom");

var bcurl = "https://boxcritters.com/play/index.html";

var scripts = ["client","items"];
var scriptinfo = {
    client:{
        pre:"../lib/client",
        post:".min.js"
    },
    items:{
        pre: "../lib/items-",
        post: ".js"
    },
};

function getSiteText(url) {
    return new Promise((resolve,reject)=>{
        request(url, function (error, response, body) {
            //console.log('error:', error); // Print the error if one occurred
            console.log('UPDATED VERSION INFO statusCode:', response && response.statusCode); // Print the response status code if a response was received
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

function getVerName(document,scriptinfo){
    var scripts = Array.from(document.scripts);
    var script = scripts.find(s=>{
        return s.src.startsWith('../');
    })
    var url = script.src;
    var ver = url.replace(scriptinfo.pre,"").replace(scriptinfo.post,"");
    return ver;
}

function getVersionInfo(ver) {
    var info = {};
    var folder = mediastart + ver + "/";

    info.clientVersion = ver.client;
    info.clientVersionNum = ver.client.split("-")[0];
    info.clientVersionName = ver.client.split("-")[1];
    info.itemsVersion = ver.items;
    return info;
}

function updateVersionNames() {
    return new Promise((resolve,reject)=>{
        getSiteText(bcurl).then(body=>{
            var document = getSiteDocument(body);
            var ver = {
                client: getVerName(document,scriptinfo.client),
                items: getVerName(document,scriptinfo.items)
            };
            
            resolve(getVersionInfo(ver));
        }).catch(reject);
    });
}


module.exports = {
    update: updateVersionNames,
    getVersionInfo: getVersionInfo
}