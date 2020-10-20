"use strict"
const Webhook = require("webhook-discord");

class WebhookManager {
    listeners;
    msg;
    constructor(name) {
        this.listeners = [];
        this.msg = new Webhook.MessageBuilder()
    }

    AddListener(url) {
        if(!url) return
        this.listeners.push(new Webhook.Webhook(url));
    }

    Invoke(msg,fields) {
       /* let sendMSG = this.msg
            .setText(msg);*/
        
        /*for (let title in fields) {
            let text = fields[title];
            sendMSG = sendMSG.addField(title, text);
        }
        sendMSG = sendMSG.setTime();*/

        this.listeners.forEach(l=>l.send(msg));
    }
}

module.exports = WebhookManager;