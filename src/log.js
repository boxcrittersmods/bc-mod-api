const { Webhook } = require('discord-webhook-node');
let whUrl = process.env.DISCORD_WEBHOOK,
	webhook = new Webhook(whUrl),
	oldLog = console.log,
	oldinfo = console.info,
	oldError = console.error,
	oldWarn = console.warn;
function prepMsg(msg) {

	msg = msg.map(m => {
		if (typeof m == "object") {
			return "```json\n" + JSON.stringify(m, undefined, 2).slice(2000 - 20) + "\n```";
		} return m;
	});
	msg = msg.join(" ");
	if (msg.length > 2000) msg = msg.slice(2000 - 3) + "...";
	return msg;
}

function send(...msg) {
	webhook.send(...msg).catch(e => {
		oldError(e.message);

	});

}


module.exports = {
	log: (...msg) => {
		oldLog(...msg);
		msg = prepMsg(msg);
		send(msg);
	},

	info: (...msg) => {
		oldinfo(...msg);
		msg = prepMsg(msg);
		send("**Info:** " + msg);
	},
	error: (...msg) => {
		oldError(...msg);
		msg = prepMsg(msg);
		send("**Error:** " + msg);
	},
	warn: (...msg) => {
		oldWarn(...msg);
		msg = prepMsg(msg);
		send("**Warning:** " + msg);
	}
};