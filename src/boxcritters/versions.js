const BoxCritters = require("./bc-site");
const moment = require("moment");
const EventHandler = require("#src/util/events");

/*
Version Format
{
    date: "yyyy-mm-dd",
    name: "",
    items: ""
}

Events
newClient
newItems
*/
var versions = [];
var versionEvents = new EventHandler();

function GetDate() {
	return moment().format("DD-MM-YYYY");
}

function SetVersions(v) {
    versions = v;
}

function GetVersions() {
    return versions;
}

function CreateVersion(name,items) {
    return { date: GetDate(), name, items };
}

function GetLatest() {
    if(versions.length==0) return;
    return versions[versions.length - 1];
}

function GetVersion(name) {
    if(versions.length==0) return;
    return versions.filter(v=>v.name==name);
}

async function CheckForNewVersion() {
	var n = await BoxCritters.GetVersion();
	var i = await BoxCritters.GetItemsFolder();
    var l = GetLatest();

    if(l != undefined){
        if(l.name == n && l.items == i) return;
    }
	var v = CreateVersion(n, i);
    versions.push(v);
    if (l != undefined) {
        var newClient = l.name != n;
        var newItems = l.items != i;
        if (newClient) versionEvents.dispatchEvent("newClient", n,{n,i});
        else if (newItems) versionEvents.dispatchEvent("newItems", i, {n,i});
    }
}

module.exports = {
    versionEvents,
    CheckForNewVersion,
    GetLatest,
    GetVersion,
    SetVersions,
    GetVersions
}