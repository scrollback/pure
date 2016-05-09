import * as Constants from '../../../lib/Constants';
import uid from '../../../lib/uid-server';
import pg from '../../../lib/pg';
import casual from 'casual';
import logger from 'winston';

let connStr = 'pg://localhost/aravind', scale = 100, numUsers = Math.max(5, 10 * scale), numRooms = Math.max(5, scale), numTopics = Math.max(5, scale), numThreads = Math.max(5, 10 * scale), numTexts = Math.max(5, 100 * scale), numMembers = Math.max(5, 10 * scale), numWatchers = Math.max(5, 10 * scale), numPresence = Math.max(5, 10 * scale);

logger.warn(
	numUsers,
	numRooms,
	numTopics,
	numThreads,
	numTexts,
	numMembers,
	numWatchers,
	numPresence
);

logger.level = 'warn';

function roomId(i) {
	casual.seed(i);
	let r = casual.word + '-' + i;
	return r;
}

function userId(i) {
	casual.seed(i);
	return casual.username.toLowerCase().replace(/\W+/g, '-') + '-' + i;
}

function threadId(s) {
	casual.seed(s);
	let i, b = new Buffer(15);
	for (i = 0; i < 15; i++) { b.writeUIntBE(r(255), i, 1);	}
	return b.toString('base64');
}

function r(n) { return Math.floor(Math.random() * n); }

function insertUser(i, done) {
	let id = userId(i);
	pg.write(connStr, [ {
		$: `INSERT INTO users (
			id, type, tags, createTime, updateTime,
			identities, timezone, locale
		) VALUES (
			$(id), ${Constants.TYPE_USER},
			'{${Constants.TAG_USER_EMAIL}}',
			extract(epoch from now())*1000000,
			extract(epoch from now())*1000000,
			$\{ident}, 330, 91
		)`,
		id: id,
		ident: [ 'email:' + casual.email.toLowerCase() ],
	} ], done);
}

function insertRoom(i, done) {
	let id = roomId(i);
	pg.write(connStr, [ {
		$: `INSERT INTO roots (
			id, type, createTime, updateTime,
			name, body, creator, updater
		) VALUES (
			$(id), ${Constants.TYPE_ROOM},
			extract(epoch from now())*1000000,
			extract(epoch from now())*1000000,
			$(id), $(body), $(uid), $(uid)
		)`,
		id: id,
		body: casual.description,
		uid: userId(r(numUsers)),
	} ], done);
}

function insertTopic(i, done) {
	let id = roomId(numRooms * 2 + i);
	pg.write(connStr, [ {
		$: `INSERT INTO roots (
			id, type, createTime, updateTime,
			name, body, creator, updater
		) VALUES (
			$(id), ${Constants.TYPE_TOPIC},
			extract(epoch from now())*1000000,
			extract(epoch from now())*1000000,
			$(id), $(body), $(uid), $(uid)
		)`,
		id: id,
		body: casual.description,
		uid: userId(r(numUsers)),
	} ], done);
}

function insertThread(i, done) {
	let tags = [];
	if (Math.random() < 0.03) tags.push(Constants.TAG_POST_HIDDEN);
	else if (Math.random() < 0.01) tags.push(Constants.TAG_POST_STICKY);

	pg.write(connStr, [ {
		$: `INSERT INTO posts (
			id, type, tags, createTime, updateTime,
			name, body, parent, room, topics, creator, updater
		) VALUES (
			$(id), ${Constants.TYPE_THREAD},
			ARRAY[$(tags)]::smallint[],
			extract(epoch from now())*1000000,
			extract(epoch from now())*1000000,
			$(name), $(body), $(rid), $(rid),
			ARRAY[$(topics)], $(uid), $(uid)
		)`,
		id: threadId(i), tags: tags,
		name: casual.sentence,
		body: casual.description,
		rid: roomId(Math.floor(i / 10)),
		topics: [ roomId(2 * numRooms + r(numTopics)) ],
		uid: userId(r(numUsers)),
	} ], done);
}

function insertText(i, done) {
	let tags = [];
	if (Math.random() < 0.02) tags.push(Constants.TAG_POST_HIDDEN);

	pg.write(connStr, [ {
		$: `INSERT INTO posts (
			id, type, tags, createTime, updateTime,
			body, parent, room, creator, updater
		) VALUES (
			$(id), ${Constants.TYPE_TEXT},
			ARRAY[$(tags)]::smallint[],
			extract(epoch from now())*1000000,
			extract(epoch from now())*1000000,
			$(body), $(tid), $(rid), $(uid), $(uid)
		)`,
		id: uid(),
		tags: tags,
		body: casual.description,
		tid: threadId(Math.floor(i / 10)),
		rid: roomId(Math.floor(i / 100)),
		uid: userId(r(numUsers)),
	} ], done);
}

function insertMember(i, done) {
	let tags = [];
	if (Math.random() < 0.01) tags.push(Constants.ROLE_MUTE);
	if (Math.random() < 0.01) tags.push(Constants.ROLE_LIKE);
	if (Math.random() < 0.001) tags.push(Constants.ROLE_FLAG);

	pg.write(connStr, [ {
		$: `INSERT INTO members (
			"user", item, tags, role
		) VALUES (
			$(uid), $(rid), ARRAY[$(tags)]::smallint[],
			${Constants.ROLE_FOLLOWER}
		)`,
		rid: roomId(r(numRooms)),
		uid: userId(r(numUsers)),
		tags: tags,
	} ], done);
}

function insertWatcher(i, done) {
	let tags = [];
	if (Math.random() < 0.01) tags.push(Constants.ROLE_MUTE);
	if (Math.random() < 0.01) tags.push(Constants.ROLE_LIKE);
	if (Math.random() < 0.001) tags.push(Constants.ROLE_FLAG);

	pg.write(connStr, [ {
		$: `INSERT INTO watchers (
			"user", item, tags, role
		) VALUES (
			$(uid), $(rid), ARRAY[$(tags)]::smallint[],
			${Constants.ROLE_FOLLOWER}
		)`,
		rid: threadId(r(numThreads)),
		uid: userId(r(numUsers)),
		tags: tags,
	} ], done);
}

function insertPresence(i, done) {
	pg.write(connStr, [ {
		$: `INSERT INTO presence (
			"user", item, resource, status
		) VALUES (
			$(uid), $(rid), $(res), $(status)
		)`,
		rid: roomId(r(numRooms)),
		uid: userId(r(numUsers)),
		res: uid(),
		status: Math.random() < 0.05 ?
			Constants.STATUS_ONLINE :
			Constants.STATUS_OFFLINE,
	} ], done);
}

function repeat(fn, times) {
	return new Promise(function (resolve) {
		function next() {
			fn(times, function () {
				times--;
				if (times > 0) next();
				else resolve();
			});
		}
		next();
	});
}

logger.warn('Inserting users...');
repeat(insertUser, numUsers)
.then(function () {
	logger.warn('Done. Inserting rooms...');
	return repeat(insertRoom, numRooms);
}).then(function () {
	logger.warn('Done. Inserting topics...');
	return repeat(insertTopic, numTopics);
}).then(function () {
	logger.warn('Done. Inserting threads...');
	return repeat(insertThread, numThreads);
}).then(function () {
	logger.warn('Done. Inserting texts...');
	return repeat(insertText, numTexts);
}).then(function () {
	logger.warn('Done. Inserting members...');
	return repeat(insertMember, numMembers);
}).then(function () {
	logger.warn('Done. Inserting watchers...');
	return repeat(insertWatcher, numWatchers);
}).then(function () {
	logger.warn('Done. Inserting presence...');
	return repeat(insertPresence, numPresence);
}).then(function () {
	logger.warn('All done.');
});
