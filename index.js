require('module-alias/register')
require('dotenv').config();

const webserver = require("tn-webserver");
const app = require('#src/app');

var server = webserver(app);
