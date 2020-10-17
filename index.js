require('module-alias/register')
require('dotenv').config();


{
	const { Webhook } = require('discord-webhook-node');
	var whUrl = process.env.DISCORD_WEBHOOK
	var webhook = new Webhook(whUrl)
	var oldLog = console.log;
	var oldinfo = console.info;
	var oldError= console.error;
	var oldWarn = console.warn;
	console.log = (...msg) =>{
		oldLog(...msg);
		msg = msg.map(m=>{
			if(typeof(m)=="object") {
				return "```json\n"+JSON.stringify(m)+"\n```"
			} return m;
		})
		msg = msg.join(" ")
		if(msg.length>2000) return
		webhook.send(msg)
	}
	
	console.info = (...msg) =>{
		oldinfo(...msg);
		msg = msg.map(m=>{
			if(typeof(m)=="object") {
				return "```json\n"+JSON.stringify(m)+"\n```"
			} return m;
		})
		msg = msg.join(" ")
		if(msg.length>2000) return
		webhook.send("**Info:** "+msg)
	}
	console.error = (...msg) =>{
		oldError(...msg);
		msg = msg.map(m=>{
			if(typeof(m)=="object") {
				return "```json\n"+JSON.stringify(m)+"\n```"
			} return m;
		})
		msg = msg.join(" ")
		if(msg.length>2000) return
		webhook.send("**Error:** "+msg)
	}
	console.warn = (...msg) =>{
		oldWarn(...msg);
		msg = msg.map(m=>{
			if(typeof(m)=="object") {
				return "```json\n"+JSON.stringify(m)+"\n```"
			} return m;
		})
		msg = msg.join(" ")
		if(msg.length>2000) return
		webhook.send("**Warning:** "+msg)
	}
}

require("bcmc-community-tracker");

const webserver = require("tn-webserver");
const app = require('#src/app');

var server = webserver(app);



