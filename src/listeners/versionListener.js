const bcVersions = require("#src/boxcritters/versions");
const github = require('#src/util/github');
const WebhookManager = require('#src/util/webhook');

var _sha = "";
var whUrl = process.env.DISCORD_WEBHOOK
var webhook = new WebhookManager("versions");
webhook.AddListener(whUrl);

async function Init() {
    var { v, s } = await github.loadVersions();
    if (!v) return;
    _sha = s;
    bcVersions.SetVersions(v);
}

function SaveToGithub() {
    var v = bcVersions.GetVersions();
    github.saveVersions(v,_sha);
}

var listeners = (() => {
    function NewClient(n, v) {
        webhook.Invoke("", {
            "client": v.n,
            "itemsFolder":v.i
        })
        SaveToGithub();
    }
    function NewItems(i,v) {
        webhook.Invoke("New ItemsFolder", {
            "client": v.n,
            "itemsFolder":v.i
        });
        SaveToGithub();
    }
    return {
        NewClient,
        NewItems
    }
})();

bcVersions.versionEvents.addEventListener("newClient",listeners, listeners.NewClient);
bcVersions.versionEvents.addEventListener("newItems", listeners, listeners.NewItems);

module.exports = {
    Init
};