"use strict";
require('module-alias/register');
require('dotenv').config();
Object.assign(console, require('./src/log'));

if (!process.env.LOCAL) require("bcmc-community-tracker");

const webserver = require("tn-webserver");
const app = require('#src/app');

webserver(app);



