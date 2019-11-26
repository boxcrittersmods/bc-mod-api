require('module-alias/register')

const webserver = require("tn-webserver");
const app = require('#src/app');

webserver(app);