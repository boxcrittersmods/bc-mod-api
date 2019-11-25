const BoxCritters = require("./bc-site");

function GetTextureData() {

}


var t = {};world.player.inventory.forEach(i => {if (!t[i.slot]) t[i.slot] = [];t[i.slot].push(i.itemId);});console.log(t);t = undefined;