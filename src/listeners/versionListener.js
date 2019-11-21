const bcVersions = require("#src/boxcritters/versions");
const github = require('#src/util/github');

var _sha = "";

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
    }
    function NewItems(i) {
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