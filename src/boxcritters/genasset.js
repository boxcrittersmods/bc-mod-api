const BoxCritters = require("./bc-site");
const bcVersions = require("./versions");
const Website = require('#src/util/website');
const path = require('path');

//data
const textureDataJson = require('#data/texture-data.json');
const sitesJson = require('#data/sites.json');
const iconsJson = require('#data/icons.json');


function GetClientScript() {
    var ver = bcVersions.GetLatest()||{name:'LOCAL',items:"LOCAL"};
    var tp = {
        "name": "client-script",
        "label": "Client Script",
        "hidden": true,
        "site": "boxcritters",
        "type": "js",
        "filename": `client${ver.name}.js`
    };
    return tp;
}
/*

  {
    "name": "beaver",
    "label": "Beaver",
    "site": "boxcritters",
    "type": "media",
    "category": "critters",
  },
*/
async function GetCritters() {
    var host = sitesJson.find(s => s.name == 'boxcritters').url;
    var manifests = await BoxCritters.GetManifests();
    var loc = manifests.find(m => m.id == 'critters').src;
    var url = host + loc;
    var website = Website.Connect(url);
    var critterInfo = await website.getJson();
    var critters = Object.keys(critterInfo);
    var tp = critters.map(critter => ({
        "name": `${critter}`,
        "site": "boxcritters",
        "type": "media",
        "category": `${path.dirname(critterInfo[critter].images[0]).split(path.sep).pop()}`
    }));
    return tp;

}
async function GetSymbols() {
    var host = sitesJson.find(s => s.name == 'boxcritters').url;
    var manifests = await BoxCritters.GetManifests();
    console.log(manifests);
    var loc = manifests.find(m => m.id == 'symbols').src;
    var url = host + loc;
    var website = Website.Connect(url);
    var symbols = (await website.getJson()).images;
    var tp = symbols.map(symbol => ({
        "name": `${path.basename(symbol, path.extname(symbol))}`,
        "site": "boxcritters",
        "type": "media",
        "category": "symbols"
    }));
    return tp;
}
async function GetEffects() {
    var host = sitesJson.find(s => s.name == 'boxcritters').url;
    var manifests = await BoxCritters.GetManifests();
    var loc = manifests.find(m => m.id == 'effects').src;
    var url = host + loc;
    var website = Website.Connect(url);
    var effects = (await website.getJson()).images;
    var tp = effects.map(effect => ({
        "name": `${path.basename(effect, path.extname(effect))}`,
        "site": "boxcritters",
        "type": "media",
        "category": "effects"
    }));
    return tp;
}
async function GetItems() {
    var host = sitesJson.find(s => s.name == 'boxcritters').url;
    var manifests = await BoxCritters.GetManifests();
    var loc = manifests.find(m => m.id == 'items').src;
    var url = host + loc;
    var website = Website.Connect(url);
    var itemsData = await website.getJson();
    var items = itemsData.images;
    var tp = items.map(item => ({
        "name": `${path.basename(item, path.extname(item))}`,
        "site": "boxcritters",
        "type": "media",
        "category": "items",
        "filename":`${itemsData.build}/${path.basename(item, path.extname(item))}.json`
    }));
    return tp;
}
async function GetIcons() {
    var icons = iconsJson;
    var tp = icons.map(icon => ({
        "name": `${icon.name}`,
        "site": "boxcritters",
        "type": "media",
        "category": `icons/${icon.slot}`
    }));
    return tp;
}
async function GetMonsters() {
    return [];
}
async function GetRooms() {
    return [];
}

async function GetTextureData() {
    var clientscript = GetClientScript();
    var critters = await GetCritters();
    var symbols = await GetSymbols();
    var effects = await GetEffects();
    var items = await GetItems();
    var icons = await GetIcons();
    var rooms = await GetRooms();
    //var monsters = await GetMonsters();


    var textures = textureDataJson;
    textures.push(clientscript);
    textures.push(...critters);
    textures.push(...symbols);
    textures.push(...effects);
    textures.push(...items);
    textures.push(...icons);
    //textures.push(...rooms);
    return textures;
}


//JSON.stringify(world.player.inventory.map(i => ({"name":i.itemId,"slot":i.slot}))
module.exports = {
    GetTextureData
}