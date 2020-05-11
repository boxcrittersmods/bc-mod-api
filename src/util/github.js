var GniddomApp = require('./gh-app');
var DISABLE_GITHUB = process.env.GH_APP_PK == undefined;

var octokit;
var owner = "boxcritters";
var repo = "bc-mod-api";

if (DISABLE_GITHUB) {
	console.log("Github Disabled for testing");
}

async function init() {
	if (DISABLE_GITHUB) return;
	octokit = await GniddomApp.getClient(await GniddomApp.getAccessToken(owner, repo));

	octokit.request("/").catch(error => {
		if (error.request.request.retryCount) {
			console.log(
				`request failed after ${error.request.request.retryCount} retries`
			);
		}
		console.error(error);
	});
}


async function sendFeedback(repo, text, summary) {
	var title = "Feedback Submission";
	if (summary) {
		title = summary + " - " + title;
	}
	var body = text;
	return (
		await octokit.issues.create({
			owner,
			repo,
			title,
			body
		})
	).data;
}

async function loadVersions() {
	if (DISABLE_GITHUB) return {};
	var path = "data/versions.json";

	var o = await octokit.repos.getContents({
		owner,
		repo,
		path
	});
	var raw = Buffer.from(o.data.content, o.data.encoding).toString();
	var vers = JSON.parse(raw);
	lastSaved = vers;
	return { v: vers, s: o.data.sha };
}

function saveVersions(versions, sha) {
	if (DISABLE_GITHUB) return;
	/*if(lastSaved==versions) {
        return;
    }*/
	var versionText = JSON.stringify(versions, "", 2);
	var path = "data/versions.json";
	var message = "Updated Versions";
	var content = Buffer.from(versionText).toString("base64");
	lastSaved = versions;
	octokit.repos.createOrUpdateFile({
		owner,
		repo,
		path,
		message,
		content,
		sha
	});
}
/*var onInit = () => { };
init().then(() => {
	console.log("gh")
	onInit();
}).catch((e)=>{
	console.log(e)
});*/

async function createMod(data, url)
{
	if (DISABLE_GITHUB) return;
	var tmp_octokit = await GniddomApp.getClient(await GniddomApp.getAccessToken(owner, "boxcrittersmods.ga"));
	var version = data.match(/\/\/\s*@version\s+(.*)\s*\n/i)[1];
	var name = data.match(/\/\/\s*@name\s+(.*)\s*\n/i)[1];
	var description = data.match(/\/\/\s*@description\s+(.*)\s*\n/i)[1];
	var author = data.match(/\/\/\s*@author\s+(.*)\s*\n/i)[1];
	var icon = data.match(/\/\/\s*@icon\s+(.*)\s*\n/i);
	var content = `---\ntitle: ${name}\nauthor:\n  - ${author}\ndescription: ${description}\ndate: 14-04-2019\nfeatured: false\nuserscript: true\ninstall: ${url}\nrecommend: false\n`
	if (icon)
	{
		content += `icon: ${icon[1]}\n`;
	}
	content += `---\n`;
	content = new Buffer(content).toString("base64");
	var path = `_mods/${name.toLowerCase()}.md`;
	var message = `New mod: ${name}.`;
	var repo = "boxcrittersmods.ga";
	tmp_octokit.repos.createFile({
		owner,
		repo,
		path,
		message,
		content
	});
}

module.exports = { init, sendFeedback, saveVersions, loadVersions, createMod };
var none = function() {
	return {};
};
/*if (DISABLE_GITHUB)
	module.exports = {
		sendFeedback: none,
		saveVersions: none,
		loadVersions: none
	};*/
