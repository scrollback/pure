import { formatShort } from '../../lib/Time';
import { config } from '../../core-server';
import Logger from '../../lib/logger';
const log  = new Logger(__filename);
let currentU = {},
	currentR: Array<Object> = [];

function userFromUserRel(user) {
	return {
		id: user.userid,
		identities: user.identities,
	};
}

function relFromUserRel(rel) {
	// console.log("rel: ", rel)
	return {
		user: rel.userid,
		threadTitle: rel.threadtitle,
		threadId: rel.threadid,
		text: rel.body,
		parents: rel.parents,
		item: rel.item,
		roles: rel.roles,
		score: rel.score,
		room: rel.roomname,
		roomId: rel.roomid,
		count: rel.textCount || rel.children,
		displayTime: formatShort(rel.createtime),
	};
}

function buildMailObj(userRel) {
	const rel = relFromUserRel(userRel),
		thread = {
			encodeURIComponent: '?utm_source=Belongmention&utm_medium=Email&utm_term=' + encodeURIComponent(rel.threadTitle),
			id: rel.threadId,
			title: rel.threadTitle,
			score: rel.score,
			counts: rel.count,
			displayTime: rel.displayTime
		},
		user = userFromUserRel(userRel);
	let cUserRel = false;

	if (user.id !== currentU.id) {
		if (Object.keys(currentU).length > 0) {
			cUserRel = {
				currentUser: currentU,
				currentRels: currentR,
			};
		}
		currentU = user;
		currentR = [
			{
				id: rel.roomId,
				room: rel.room,
				threads: [ thread ],
				domain: config.server.protocol + '//' + config.server.host,
			},
		];
	} else {
		let sameRoom = false;

		for (const item of currentR) {
			// console.log("item: ", item)
			if (rel.room === item.room) {
				item.threads.push(thread);
				sameRoom = true;
				break;
			}
		}

		if (!sameRoom) {
			currentR.push({
				id: rel.roomId,
				room: rel.room,
				threads: [ thread ],
				domain: config.server.protocol + '//' + config.server.host,
			});
		}

	}
	if (cUserRel) {		// sortAndTrim()

		cUserRel.currentRels.sort((a, b) => { // sort according to the no of threads in a room
			return b.threads.length - a.threads.length;
		});

		for (let i = 0; i < cUserRel.currentRels.length; i++) {
			cUserRel.currentRels[i].threads.sort((a, b) => { // sort threads according to count
				return b.counts - a.counts;
			});
			if (cUserRel.currentRels[i].threads.length > 10) {
				cUserRel.currentRels[i].threads = cUserRel.currentRels[i].threads.slice(0, 10);
			}
		}
	}
	return cUserRel;
}

export default function (userRel: Object) {
	// console.log(userRel.user)

	if (Object.keys(userRel).length === 0) {
		const lastUser = currentU,
			lastRel = currentR;
		for (let i = 0; i < lastRel.length; i++) {
			log.info('lastRel[i].threads.length: ', lastRel[i].threads.length);
			if (lastRel[i].threads.length > 10) {
				lastRel[i].threads = lastRel[i].threads.slice(0, 10);
			}
		}
		currentU = {};
		currentR = [];
		return {
			currentUser: lastUser,
			currentRels: lastRel,
		};
	}
	const emailObj = buildMailObj(userRel);

	return emailObj;
}
