"use strict";
require('module-alias/register');
require('dotenv').config();


{
	const { Webhook } = require('discord-webhook-node');
	let whUrl = process.env.DISCORD_WEBHOOK;
	let webhook = new Webhook(whUrl);
	let oldLog = console.log;
	let oldinfo = console.info;
	let oldError = console.error;
	let oldWarn = console.warn;
	console.log = (...msg) => {
		oldLog(...msg);
		msg = msg.map(m => {
			if (typeof (m) == "object") {
				return "```json\n" + JSON.stringify(m) + "\n```";
			} return m;
		});
		msg = msg.join(" ");
		if (msg.length > 2000) return;
		webhook.send(msg);
	};

	console.info = (...msg) => {
		oldinfo(...msg);
		msg = msg.map(m => {
			if (typeof (m) == "object") {
				return "```json\n" + JSON.stringify(m) + "\n```";
			} return m;
		});
		msg = msg.join(" ");
		if (msg.length > 2000) return;
		webhook.send("**Info:** " + msg);
	};
	console.error = (...msg) => {
		oldError(...msg);
		msg = msg.map(m => {
			if (typeof (m) == "object") {
				return "```json\n" + JSON.stringify(m) + "\n```";
			} return m;
		});
		msg = msg.join(" ");
		if (msg.length > 2000) return;
		webhook.send("**Error:** " + msg);
	};
	console.warn = (...msg) => {
		oldWarn(...msg);
		msg = msg.map(m => {
			if (typeof (m) == "object") {
				return "```json\n" + JSON.stringify(m) + "\n```";
			} return m;
		});
		msg = msg.join(" ");
		if (msg.length > 2000) return;
		webhook.send("**Warning:** " + msg);
	};
}

if (!process.env.LOCAL) require("bcmc-community-tracker");

const webserver = require("tn-webserver");
const app = require('#src/app');

webserver(app);



