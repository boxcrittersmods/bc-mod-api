global.config = require('./config')

const webserver = require("webserver");
const app = require('./src/app');

webserver(app);