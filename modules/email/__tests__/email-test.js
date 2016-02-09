
jest.dontMock("../digestEmail");

let sendDigestEmail = require("../digestEmail"),
	pg = require("../../../lib/pg"),
	constants = require("../../../lib/constats.json"),
	connString = "pg://scrollback: @localhost/pure";

describe("send digest email", function () {
	console.log("helo")
	it.only("send email to users who are offline", function () {
		pg.read(connString, {
			$: "SELECT * FROM jobs WHERE jobid = &{jid}",
			jid: constants.JOB_EMAIL_DIGEST
		}, (e, r) => {
			sendDigestEmail(r)
		});
	});
});