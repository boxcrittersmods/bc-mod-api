"use strict";
let { Cache: MemoryCache } = require('memory-cache');

function Cache() {
	if (!new.target) return;
	this.cache = new MemoryCache();
}

Cache.prototype.set = function (key, value) {
	//this.cache.set(key,value);
	this.cache.put(key, value);
};

Cache.prototype.get = function (key) {
	return this.cache.get(key);
};

Cache.prototype.clear = function () {
	this.cache.clear();
};

module.exports = Cache;
