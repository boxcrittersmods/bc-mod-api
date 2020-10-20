"use strict";
const express = require("express");
const db = require("#src/util/db");

let router = express.Router();

router.use(express.json());

router.get('/:collectionId?/:itemId?', async function (req, res) {
	res.type("application/json");
	let { collectionId, itemId } = req.params;
	let data;
	if (!collectionId) {
		data = await db.all();
	} else if (!itemId) {
		data = await db.list(collectionId);
	} else {
		data = await db.get(collectionId, itemId);
	}
	res.send(data || { error: "Item Not found" });
});

module.exports = router;
