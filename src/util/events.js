function EventHandler() {
    if(!new.target) return;
    this.e = {};
}
EventHandler.prototype.addEventListener = function(t, i, a) {
    if(!this.e[t]) this.e[t] = [];
    this.e[t].push({i,a});
},
EventHandler.prototype.removeEventListener = function(t, i, a) {
    if(!this.e[t]) return;
    this.e[t] = this.e[t].filter(l=>l!=={i,a});
},
EventHandler.prototype.dispatchEvent = function(t, ...p) {
    if(!this.e[t]) return;
    this.e[t].forEach(({i,a})=>{
        try {
            a.call(i,...p);
            
        } catch (error) {
            i[a.name](...p);
        }
    });
}

module.exports = EventHandler;