"use strict";
require('module-alias/register');
require('dotenv').config();

if (!process.env.LOCAL) {
	Object.assign(console, require('./src/log'));
	require("bcmc-community-tracker");
}

const webserver = require("tn-webserver");
const app = require('#src/app');

webserver(app);



