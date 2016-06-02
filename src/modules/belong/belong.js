/* @flow */
/* eslint-disable no-param-reassign*/

import { bus, cache, config } from '../../core-server';
import winston from 'winston';
import { room as Room, roomrel as RoomRel } from '../../models/models';
import * as place from '../../lib/places';
import * as constants from '../../lib/Constants';
import uuid from 'node-uuid';
import * as pg from '../../lib/pg';
import type { User } from '../../lib/schemaTypes';

const placesRoles = [ constants.ROLE_WORK, constants.ROLE_HOME, constants.ROLE_HOMETOWN ];
// postgres mock, because jest is acting up.

// const pg = {
// 	read: (conn, sql, cb) => {
// 		setImmediate(() => cb(null, [
// 			{
// 				id: '5055f5b6-466e-46bc-a55d-fe020ee9ac42',
// 				name: 'Bangalore',
// 				identities: [ 'place:ChIJbU60yXAWrjsR4E9-UejD3_g' ]
// 			}
// 		]));
// 	}
// };

// */

function typeStringToNumber(type) {
	switch (type) {
	case 'home':
		return constants.ROLE_HOME;
	case 'work':
		return constants.ROLE_WORK;
	case 'hometown':
		return constants.ROLE_HOMETOWN;
	}
	return 0;
}

function addRooms(change, addable, all) {
	const identityIdMap = {};

	for (const stub of all) {
		if (stub.id) {
			identityIdMap[stub.identity] = stub;
			 continue; /* already in db */
		 }
	}

	for (const stub of addable) {
		if (stub.id) {
			 continue; /* already in db */
		 }

		stub.id = uuid.v4();
		identityIdMap[stub.identity] = stub;
		stub.parents = stub.parents.map(e => identityIdMap[e].id);
		stub.parents.filter(e => e); // filter out rooms that with no parents.
		change[stub.id] = new Room({
			id: stub.id,
			name: stub.name,
			tags: [ stub.type ],
			identities: [ stub.identity ],
			parents: stub.parents.reverse(),
		});
	}
}

function addRels(change, user, resources, addable) {
	for (const stub of addable) {
		if (stub.exists && !stub.doUpdate) continue;

		const rel = new RoomRel({
			user: user.id,
			item: stub.id,
			roles: [ ...stub.rels, constants.ROLE_FOLLOWER ].reduce((prev, curr) => {
				if (prev.indexOf(curr) < 0) prev.push(curr);
				return prev;
			}, []),
			resources,
		});

		change[rel.id] = rel;
	}
}

function updateRels(change, user, updateable) {
	for (const stub of updateable) {
		if (stub.id && stub.doUpdate) {
			const rel = new RoomRel({
				user: user.id,
				item: stub.id,
				roles: [ ...stub.rels, constants.ROLE_FOLLOWER ].reduce((prev, curr) => {
					if (prev.indexOf(curr) < 0) prev.push(curr);
					return prev;
				}, []),
			});

			change[rel.id] = rel;
		}
	}
}

function removeRels(change, removable) {
	for (const rel of removable) {
		const c = new RoomRel({ roles: [], item: rel.item, user: rel.user });
		change[c.id] = c;
	}
}

function sendInvitations (resources, user, deletedRels, relRooms, ...stubsets) {
	const stubs = {}, changedRels = {},
		all = [], addable = [], removable = [], updateable = [],
		change = {};

	deletedRels = deletedRels.map(typeStringToNumber);

	for (const stubset of stubsets) {
		changedRels[stubset.rel] = true;

		// console.log("Changed rels:", stubset.rel);
		for (const stub of stubset.stubs) {
			stub.rels = [ stubset.rel ];
			if (!stubs[stub.identity]) {
				stubs[stub.identity] = stub;
			} else {
				stubs[stub.identity].rels.push(stubset.rel);
			}
		}
	}

	for (const relRoom of relRooms) {
		if (!relRoom.room || !relRoom.room.identities) continue;
		const identity = relRoom.room.identities.filter(
			ident => ident.substr(0, 6) === 'place:'
		)[0];

		if (stubs[identity]) {
			stubs[identity].exists = true;
			stubs[identity].rels = stubs[identity].rels.concat(relRoom.roomrel.roles);
			if (stubs[identity].rels.length !== relRoom.roomrel.roles) {
				stubs[identity].doUpdate = true;
				updateable.push(stubs[identity]);
			}
		} else {
			const types = relRoom.roomrel.roles.filter(role =>
				role >= constants.ROLE_HOME &&
				role <= constants.ROLE_HOMETOWN &&
				deletedRels.indexOf(role) > -1
			);

			if (types.length === 0) continue;
			const type = types[0];
			if (changedRels[type] || deletedRels.indexOf(type) >= 0) {
				let shouldRemove = true;

				for (const role of placesRoles.filter(e => e !== type)) {
					if (relRoom.roomrel.roles.indexOf(role) >= 0) {
						shouldRemove = false;
						break;
					}
				}

				if (shouldRemove) {
					removable.push(relRoom.roomrel);
				} else {
					relRoom.roomrel.roles.splice(relRoom.roomrel.roles.indexOf(type), 1);

					const newStub = {
						identity,
						rels: relRoom.roomrel.roles,
						doUpdate: true,
					};
					updateable.push(newStub);
					stubs[identity] = newStub;
				}

			} else {
				all.push({ identity, type, name: relRoom.room.name });
			}
		}
	}

	for (const identity in stubs) {
		const stub = stubs[identity];

		all.push(stub);
		if (!stub.exists) { addable.push(stub); }
	}

	pg.read(config.connStr, {
		$: 'SELECT * FROM "rooms" WHERE identities && &{idents}',
		idents: all.map(a => a.identity),
	}, (err, rooms) => {
		if (err) { winston.error(err); return; }
		for (let room of rooms) {
			room = new Room(room);

			const stub = stubs[room.identities.filter(
				ident => ident.substr(0, 6) === 'place:'
			)[0]];

			if (stub) stub.id = room.id;
		}

		addRooms(change, addable, all);
		addRels(change, user, resources, addable);
		updateRels(change, user, updateable);
		removeRels(change, removable);

		bus.emit('change', { entities: change, source: 'belong' });
	});
}

bus.on('change', change => {

	/* While the work of this module is asynchronous, it will allow
	the change to continue immediately and emit a new change when the
	work is complete. */

	winston.info('Belong: change: ', change);
	if (change.entities) {
		for (const id in change.entities) {
			const user:User = change.entities[id],
				deletedRels = [],
				promises = [];

			if (
				user.type !== constants.TYPE_USER ||
				!user.params || !user.params.places
			) { continue; }

			if (user.params && user.params.places) {
				const { home, work, hometown } = user.params.places;

				if (home && home.id) {
					promises.push(place.getStubset(home.id, constants.ROLE_HOME));
				}

				if (work && work.id) {
					promises.push(place.getStubset(work.id, constants.ROLE_WORK));
				}

				if (hometown && hometown.id) {
					promises.push(place.getStubset(hometown.id, constants.ROLE_HOMETOWN));
				}

				for (const rel in user.params.places) {
					if (user.params.places[rel] === null) {
						deletedRels.push(rel);
					}
				}
			} else {
				return;
			}

			/* Fetch the current rooms of this user. */
			const currentRels = new Promise((resolve, reject) => {
				cache.query({
					type: 'roomrel',
					link: { room: 'item' },
					filter: { user: id, roles_cts: [ constants.ROLE_FOLLOWER ] },
					order: 'createTime',
				}, [ -Infinity, Infinity ], (err, results) => {
					if (err) { reject(err); return; }
					resolve(results);
				});
			});

			const resource = change && change.auth && change.auth.resource;

			Promise.all([ currentRels, ...promises ])
			.then((res) => sendInvitations({
				[resource]: constants.PRESENCE_FOREGROUND,
			}, user, deletedRels, ...res))
			.catch(err => winston.error(err));
		}
	}
});
