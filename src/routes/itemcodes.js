"use strict";
const express = require("express");
const Website = require('#src/util/website');

let router = express.Router();
let itemCodeWiki = Website.Connect("https://box-critters.fandom.com/wiki/Item_Codes");

router.use(express.json());

function camelize(str) {
	return str.trim().replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
		if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
		return index === 0 ? match.toLowerCase() : match.toUpperCase();
	});
}


var codes = [];
codes[17] = "/freeitem";
codes[18] = "/darkmode";
codes[19] = "/tbt";
codes[20] = "/explore";

var tableToJson = (table, t) => {
	let keys;
	return [].reduce.call(table.rows, (items, row, r) => {
		if (!r) keys = [].map.call(row.cells, n => camelize(n.innerHTML.split("\n").join("")
			.replace("Available from", "Date released")
			.replace("Available until", "Date expired")));
		else {
			items[r - 1] = [].reduce.call(row.cells, (item, cell, c) => {
				let v = cell.innerHTML.split("\n").join("").replace(/<[^>]*>/g, "");
				v = v == "Still available" ? false : v;
				v = v == "Date unknown" ? undefined : v;
				item[keys[c]] = v;
				return item;
			}, {});
			delete items[r - 1].icon;
			if (!items[r - 1].code) items[r - 1].code = codes[t];
		}
		return items;
	}, []);
};


router.get('/', async function (req, res) {
	//res.type("application/json");
	let document = await itemCodeWiki.getDocument();
	let page = document.getElementById("WikiaPage");
	let tables = Array.from(page.querySelectorAll("table"));
	let items = [].map.call(tables/*.slice(0, -4)*/, tableToJson).flat()
		.sort((a, b) => {
			return new Date(b.dateReleased) - new Date(a.dateReleased);
		});
	res.send(items);
});

module.exports = router;