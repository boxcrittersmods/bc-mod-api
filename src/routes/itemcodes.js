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


let codes = {
	"29": "/freeitem",
	"3": "/darkmode",
	"2": "/tbt",
	"1": "/explore",
};

var tableToJson = (table, t, { length: count }) => {
	let keys;
	let rowSpan = [];
	return [].reduce.call(table.rows, (items, row, r) => {
		if (!r) keys = [].map.call(row.cells, n => camelize(n.innerHTML.split("\n").join("").toLowerCase()
			.replace("available from", "date released")
			.replace("available until", "date expired")));
		else {
			console.log(keys);
			//updateRowSpan
			rowSpan = rowSpan.map(c => (c.rowSpan = c.rowSpan - 1 + "", c)).filter(c => +c.rowSpan);
			row.prepend(...rowSpan);
			if (rowSpan.length) console.log({ rowSpan: rowSpan.map(c => c.innerText) });
			rowSpan = [];

			items[r - 1] = [].reduce.call(row.cells, (item, cell, c) => {
				cell.innerText = cell.innerHTML.split("\n").join("").replace(/<[^>]*>/g, "");
				cell.innerText = cell.innerText.toLowerCase() == "still available" ? false : cell.innerText;
				item[keys[c]] = cell.innerText;
				if (+cell.rowSpan && +cell.rowSpan > 1) {
					rowSpan.push(cell);
				}
				return item;
			}, {});
			delete items[r - 1].icon;
			if (!items[r - 1].code) {
				console.log("Table:", t + 1, "/", count);
				for (let i of Object.keys(codes).reverse()) {
					let min = count - i - 1;
					console.log("--min", min, codes[i]);
					if (min < t) items[r - 1].code = codes[i];
				}
			}
		};
		return items;
	}, []);
};


router.get('/', async function (req, res) {
	//res.type("application/json");
	let document = await itemCodeWiki.getDocument();
	let page = document.getElementsByClassName("WikiaPage")[0];
	let tables = Array.from(page.querySelectorAll("table"));
	let items = [].map.call(tables/*.slice(0, -4)*/, tableToJson).flat()
		.sort((a, b) => {
			let fixDate = date => date === "Date unknown" ? 0 : !date ? Date.now() : date;
			return new Date(fixDate(b.dateReleased)) - new Date(fixDate(a.dateReleased)) ||
				new Date(fixDate(a.dateExpired)) - new Date(fixDate(a.dateExpired));
		});
	for (const item of items) {
		item.dateReleased = new Date(item.dateReleased || undefined) || false;
		item.dateExpired = new Date(item.dateExpired || undefined) || false;
	}
	res.send(items);
});

module.exports = router;