const NodeCache = require("node-cache");

function Cache() {
    if(!new.target) return;
    this.cache = new NodeCache({ stdTTL: 10, checkperiod: 5 });
}

Cache.prototype.set = function(key,value) {
    this.cache.set(key,value);
}

Cache.prototype.get = function(key) {
    return this.cache.get(key);
}

module.exports = Cache;