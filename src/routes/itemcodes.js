"use strict";
const express = require("express");
const Website = require('#src/util/website');

let router = express.Router();
let itemCodeWiki = Website.Connect("https://box-critters.fandom.com/wiki/Item_Codes");
console.log(itemCodeWiki);

router.use(express.json());


router.get('/', async function (req, res) {
	res.type("application/json");
});

module.exports = router;