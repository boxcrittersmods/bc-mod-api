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
       /* var sendMSG = this.msg
            .setText(msg);*/
        
        /*for (var title in fields) {
            var text = fields[title];
            sendMSG = sendMSG.addField(title, text);
        }
        sendMSG = sendMSG.setTime();*/

        this.listeners.forEach(l=>l.send(msg));
    }
}

module.exports = WebhookManager;