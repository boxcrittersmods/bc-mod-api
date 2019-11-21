const bcVersions = require("#src/boxcritters/versions");
const github = require('#src/util/github');
const WebhookManager = require('#src/util/webhook')

var _sha = "";
var whUrl = "https://discordapp.com/api/webhooks/647210509971619840/6Dy2FFKFWgxCrv_t_Myg-IDCO9cBARwAlIfp63mpS5dUvb2aNmvDS53LsiL6j2gLtFlA;"
var webhook = new WebhookManager("versions");
webhook.AddListener(whUrl);

async function Init() {
    var {v,s} = await github.loadVersions();
    _sha = s;
    bcVersions.SetVersions(v);
}

function SaveToGithub() {
    var v = bcVersions.GetVersions();
    github.saveVersions(v,_sha);
}

var listeners = (() => {
    function NewClient(n) {
        SaveToGithub();
        webhook.Invoke("New Version",n)
    }
    function NewItems(i) {
        SaveToGithub();
        webhook.Invoke("New Items", i);
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