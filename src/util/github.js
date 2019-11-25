const Octokit = require("@octokit/rest").plugin(
	require("@octokit/plugin-retry")
);

var octokit;
var DISABLE_GITHUB = process.env.FEEDBACK_KEY == undefined;

if (DISABLE_GITHUB) {
	console.log("Github Disabled for testing");
} else {
	octokit = new Octokit({
		auth: process.env.FEEDBACK_KEY || ""
	});
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
	if (DISABLE_GITHUB) return;
	var owner = "boxcritters";
	var repo = "bc-mod-api";
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
	var owner = "boxcritters";
	var repo = "bc-mod-api";
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

	var owner = "boxcritters";
	var repo = "bc-mod-api";
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

module.exports = { sendFeedback, saveVersions, loadVersions };
var none = function() {
	return {};
};
if (DISABLE_GITHUB)
	module.exports = {
		sendFeedback: none,
		saveVersions: none,
		loadVersions: none
	};
