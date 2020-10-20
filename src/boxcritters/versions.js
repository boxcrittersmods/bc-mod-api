"use strict"
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
let versions = [];
let versionEvents = new EventHandler();

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
    return { date: GetDate(), name/*, items */};
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
	let n = await BoxCritters.GetVersion();
	/*let i = await BoxCritters.GetItemsFolder();*/
    let l = GetLatest();

    if(l != undefined){
        if(l.name == n /*&& l.items == i*/) return;
    }
	let v = CreateVersion(n);
    versions.push(v);
    if (l != undefined) {
        let newClient = l.name != n;
        /*let newItems = l.items != i;*/
        if (newClient) versionEvents.dispatchEvent("newClient", n,{n});
        /*else if (newItems) versionEvents.dispatchEvent("newItems", i, {n,i});*/
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