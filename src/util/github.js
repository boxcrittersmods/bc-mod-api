"use strict";
let GniddomApp = require('./gh-app');
let DISABLE_GITHUB = process.env.GH_APP_PK == undefined;
DISABLE_GITHUB = true;

let octokit;
let owner = "boxcritters";
let repo = "bc-mod-api";

if (DISABLE_GITHUB) {
	console.debug("Github Disabled for testing");
}

async function init() {
	if (DISABLE_GITHUB) return;
	octokit = await GniddomApp.getClient(await GniddomApp.getAccessToken(owner, repo));

	octokit.request("/").catch(error => {
		if (error.request.request.retryCount) {
			console.debug(
				`request failed after ${error.request.request.retryCount} retries`
			);
		}
		console.error(error);
	});
}


async function sendFeedback(repo, text, summary) {
	let title = "Feedback Submission";
	if (summary) {
		title = summary + " - " + title;
	}
	let body = text;
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
	let path = "data/versions.json";

	let o = await octokit.repos.getContents({
		owner,
		repo,
		path
	});
	let raw = Buffer.from(o.data.content, o.data.encoding).toString();
	let vers = JSON.parse(raw);
	lastSaved = vers;
	return { v: vers, s: o.data.sha };
}

function saveVersions(versions, sha) {
	if (DISABLE_GITHUB) return;
	/*if(lastSaved==versions) {
		return;
	}*/
	let versionText = JSON.stringify(versions, "", 2);
	let path = "data/versions.json";
	let message = "Updated Versions";
	let content = Buffer.from(versionText).toString("base64");
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
/*let onInit = () => { };
init().then(() => {
	console.debug("gh")
	onInit();
}).catch((e)=>{
	console.debug(e)
});*/

async function createMod(data, url) {
	if (DISABLE_GITHUB) return;
	let tmp_octokit = await GniddomApp.getClient(await GniddomApp.getAccessToken(owner, "boxcrittersmods.ga"));
	let version = data.match(/\/\/\s*@version\s+(.*)\s*\n/i)[1];
	let name = data.match(/\/\/\s*@name\s+(.*)\s*\n/i)[1];
	let description = data.match(/\/\/\s*@description\s+(.*)\s*\n/i)[1];
	let author = data.match(/\/\/\s*@author\s+(.*)\s*\n/i)[1];
	let icon = data.match(/\/\/\s*@icon\s+(.*)\s*\n/i);
	let content = `---\ntitle: ${name}\nauthor:\n  - ${author}\ndescription: ${description}\ndate: 14-04-2019\nfeatured: false\nuserscript: true\button:\n  - name: Install\n  href: ${url}\nrecommend: false\n`;
	if (icon) {
		content += `icon: ${icon[1]}\n`;
	}
	content += `---\n`;
	content = new Buffer.from(content).toString("base64");
	let path = `_mods/${name.toLowerCase().replace(" ", "-")}.md`;
	let message = `New mod: ${name}.`;
	let repo = "boxcrittersmods.ga";
	tmp_octokit.repos.createFile({
		owner,
		repo,
		path,
		message,
		content
	});
}

module.exports = { init, sendFeedback, saveVersions, loadVersions, createMod };
let none = function () {
	return {};
};
/*if (DISABLE_GITHUB)
	module.exports = {
		sendFeedback: none,
		saveVersions: none,
		loadVersions: none
	};*/
