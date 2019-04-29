const assetFolder = require('./assetfolder');

function getDate() {
    return new Promise((resolve,reject)=>{
        resolve((new Date()).toISOString());
    })
}

function update() {
    return new Promise((resolve,reject)=>{
        var proms = [];
        proms.push(assetFolder.update());
        
        proms.push(getDate());
        Promise.all(proms).then(output=>{
            var api = output.reduce(o=>{
                var apiitem = {};
                for (const key in o) {
                    apiitem[key] = o[key];
                }
                return apiitem;
            });
            resolve(api);
        });

    })
}

module.exports = {
    update,
    get:()=>{
        return api;
    }
}