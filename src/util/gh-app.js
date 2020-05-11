const { Octokit } = require("@octokit/rest");
const { App } = require("@octokit/app");
const fetch = require("node-fetch");

if (process.env.GH_APP_PK != undefined) {
	// Initialize GitHub App with id:private_key pair and generate JWT which is used for
	// application level authorization
	var app = new App({
		id: process.env.GH_APP_ID,
		privateKey: process.env.GH_APP_PK
	});
	var jwt = app.getSignedJsonWebToken();

	async function getAccessToken(owner, repo) {
		// Firstly, get the id of the installation based on the repository
		var url = `https://api.github.com/orgs/${owner}/installation`;
		if (repo) url = `https://api.github.com/repos/${owner}/${repo}/installation`;
		console.log({ url });
		var install = await fetch(url, {
			headers: {
				authorization: `Bearer ${jwt}`,
				accept: "application/vnd.github.machine-man-preview+json"
			}
		});
		var installationId = (await install.json()).id;
		console.log({ installationId })
		// And acquire access token for that id
		var accessToken = await app.getInstallationAccessToken({ installationId });

		return accessToken;
	}

	var getClient = accessToken =>
		new Octokit({
			auth() {
				return `token ${accessToken}`;
			}
		});

	module.exports = {
		getAccessToken,
		getClient
	};

} else {
	module.exports = {
		getAccessToken: () => { },
		getClient: () => { }
	};
}
