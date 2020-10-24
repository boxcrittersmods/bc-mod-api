"use strict";
const NodeCache = require("node-cache");
let { Cache: MemoryCache } = require('memory-cache');

function Cache() {
	if (!new.target) return;
	//this.cache = new NodeCache({ stdTTL: 10, checkperiod: 5 });
	this.cache = new MemoryCache();
}

Cache.prototype.set = function (key, value) {
	//this.cache.set(key,value);
	this.cache.put(key, value);
};

Cache.prototype.get = function (key) {
	return this.cache.get(key);
};

module.exports = Cache;