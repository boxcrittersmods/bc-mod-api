require('module-alias/register')
require('dotenv').config();
// /require("bcmc-community-tracker");

const webserver = require("tn-webserver");
const app = require('#src/app');

var server = webserver(app);
