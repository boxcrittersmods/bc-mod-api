const path = require('path');
var root = __dirname;
var data =  path.join(root,'data');

var paths = {
    root,
    src: path.join(root,'src'),
    public: path.join(root,'pubic'),
    data
}

var json = {
    sites: path.join(root,'sites.json'),
    textureData: path.join(root,'texture-data.json')
}

var config = {
    paths,
    json
}

module.exports = config;