const webhook = require("webhook-discord");

class TrackerEvent {
    constructor(name) {
        this.listeners = [];
        this.msg = new webhook.MessageBuilder()
        .setName(name)
        .setColor("#ffffff");
    }

    AddListener(url) {
        this.listeners.push(new webhook.Webhook(url));
    }

    Invoke(msg) {
        var sendMSG = this.msg
        .setText(msg)
        .setTime();

        this.listeners.forEach(l=>l.send(sendMSG));
    }
}

module.exports = TrackerEvent;