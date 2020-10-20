"use strict";
const { MongoClient } = require('mongodb');
let dbUser = process.env.DB_USER || require("./config/token").dbUser;
let dbPassword = process.env.DB_PASSWORD || require("./config/token").dbPassword;
const uri = `mongodb+srv://${dbUser}:${dbPassword}@bcmcwebsiteitems.vkf2l.mongodb.net/items?w=majority`;

function pluralAndSingular(text) {
	let isPlural = text.endsWith("s");
	return {
		singular: isPlural ? text.slice(0, -1) : text,
		plural: isPlural ? text : text + "s"
	};
}

async function connect() {
	let client = new MongoClient(uri, { useUnifiedTopology: true });
	await client.connect({ useUnifiedTopology: true });
	return client;
}

async function disconnect(client) {
	await client.close();
}
async function listCollections() {
	let client = await connect();
	let db = client.db();
	let list = await db.listCollections().toArray();
	return list.map(c => c.name);
}

async function listItems(collectionId) {
	let client = await connect();
	let db = client.db();
	if (collectionId) collectionId = pluralAndSingular(collectionId);
	let collection = db.collection(collectionId.plural);
	let itemIds = await collection.distinct(collectionId.singular + "Id");
	await disconnect(client);
	return itemIds;
}

async function getItem(collectionId, itemId) {
	let client = await connect();
	let db = client.db();
	if (collectionId) collectionId = pluralAndSingular(collectionId);
	let collection = db.collection(collectionId.plural);
	let item = await collection.findOne({ [collectionId.singular + "Id"]: itemId });
	await disconnect(client);
	return item;
}

module.exports = {
	get: getItem,
	list: listItems,
	all: listCollections
};