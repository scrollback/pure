/* @flow */
/* eslint-disable no-param-reassign*/
import log from 'winston';
import fs from 'fs';
import uuid from 'node-uuid';
import template from 'lodash/template';
import { bus } from '../../core-server';
import Thread from '../../models/thread';
import { TYPE_ROOM,
	TYPE_THREAD,
	TAG_ROOM_AREA,
	TAG_ROOM_CITY,
	TAG_ROOM_SPOT
} from '../../lib/Constants';

type ThreadTemplate = {
	title: string;
	body: string;
	creator: string;
}

function tagStringToNumber(tag) {
	switch (tag) {
	case 'city':
		return TAG_ROOM_CITY;
	case 'area':
		return TAG_ROOM_AREA;
	case 'spot':
		return TAG_ROOM_SPOT;
	}
	return '';
}

function seedContent(room) {
	log.info('something:', JSON.stringify(room));
	fs.readdir('./templates/seed-content', (err, files: any) => {
		const changes = {
			entities: {}
		};

		if (err || !files || files.length === 0) return;

		/*
			Split filenames into array of format: [tag, number, option]
			Filter out files that doesn't belong to the current room's tags
		*/
		files = files.map(file => file.split('-'))
		.filter(e => e.length === 3)
		.filter(e => {
			return room.tags.indexOf(tagStringToNumber(e[0])) > -1;
		}
		);

		/*
			group templates into tags.
			format: {
					'area-1': [ ['area', 1, 'a.json'], ['area', 1, 'b.json']]
					'area-2': [ ['area', 2, 'a.json'], ['area', 2, 'b.json']]
			}
		*/
		files = files.reduce((prev, cur) => {
			prev[cur[0] + '-' + cur[1]] = prev[cur[0] + '-' + cur[1]] || [];
			prev[cur[0] + '-' + cur[1]].push(cur);
			return prev;
		}, {});

		// randomly pick a file for each tag:
		files = Object.keys(files).map(e => {
			return files[e][Math.ceil(Math.random() * files[e].length) - 1];
		})
		.map(e => e.join('-')) // get the template filenames back
		.map(e => fs.readFileSync('./templates/seed-content/' + e).toString())
		.map(e => {
			try {
				return JSON.parse(e);
			} catch (error) {
				return null;
			}
		});

		files.forEach((e:?ThreadTemplate) => {
			const id = uuid.v4();

			if (!e) return;
			changes.entities[id] = new Thread({
				id,
				type: TYPE_THREAD,
				name: template(e.title)({
					name: room.name
				}),
				body: template(e.body)({
					name: room.name
				}),
				parents: [ room.id ],
				creator: e.creator,
				createTime: Date.now(),
			});
		});

		bus.emit('change', changes);
	});
}

bus.on('postchange', (changes, next) => {
	const entities = changes && changes.entities || {};
	Object.keys(entities).filter(e => (
        entities[e].type === TYPE_ROOM && entities[e].createTime &&
        entities[e].createTime === entities[e].updateTime
	)).map(e => entities[e]).forEach(seedContent);
	next();
});

log.info('Content seeding module ready.');
