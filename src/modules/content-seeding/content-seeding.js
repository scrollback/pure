/* @flow */
/* eslint-disable no-param-reassign*/
import log from 'winston';
import fs from 'fs';
import uuid from 'node-uuid';
import template from 'lodash/template';
import { bus, config } from '../../core-server';
import Thread from '../../models/thread';
import Text from '../../models/text';

import * as places from '../../lib/places';
import * as upload from '../../lib/upload';
import { TYPE_ROOM,
	TYPE_TEXT,
	TYPE_THREAD,
	TAG_POST_PHOTO,
	TAG_ROOM_AREA,
	TAG_ROOM_CITY,
	TAG_ROOM_SPOT,
	TAG_POST_GAPI_SEED,
	TAG_POST_AUTO_SEED
} from '../../lib/Constants';

function parseAttributions(html) {
	return {
		author_url: html.match(/"(.*?)"/)[1],
		author_name: html.match(/>(.*?)</)[1]
	};
}

function getThumbnailObject(type, id, aspectRation) {
	const baseUrl = 'https://' + (config.s3.generateHostname || (config.s3.generateBucket + '.s3.amazonaws.com')) + '/';
	let url, width, height;

	switch (type) {
	case 'avatar':
		url = baseUrl + 'a/' + id + '/256.jpg';
		width = 256;
		height = 256;
		break;
	case 'content':
	case 'banner':
		url = baseUrl + (type === 'banner' ? 'b' : 'c') + '/' + id + '/480.jpg';
		width = 480;
		height = Math.floor(480 / aspectRation);
		break;
	}

	return {
		url,
		width,
		height
	};
}

function getImageUrl(type, id, filename, generated) {
	const mode = generated ? 'generate' : 'upload';
	const host = config.s3[mode + 'Hostname'];
	const bucket = config.s3[mode + 'Bucket'] + '.s3.amazonaws.com';
	const baseUrl = 'https://' + (host || bucket) + '/';
	return baseUrl + (type === 'banner' ? 'b' : 'c') + '/' + id + '/' + filename;
}

type ThreadTemplate = {
	title: string;
	body: string;
	creator: string;
}

const types = [ 'hospital', 'restaurant', 'school', 'grocery_or_supermarket' ];

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
				tags: [ TAG_POST_AUTO_SEED ],
				parents: [ room.id ],
				creator: e.creator,
				createTime: Date.now(),
			});
		});

		bus.emit('change', changes);
	});
}

function buildThread(room, type) {
	const id = uuid.v4();
	let name;

	switch (type) {
	case 'grocery_or_supermarket':
		name = 'Grocery stores ' + (room.name ? 'around ' + room.name : 'near by.');
		break;
	case 'school':
		name = 'Schools ' + (room.name ? 'around ' + room.name : 'near by.');
		break;
	case 'hospital':
		name = 'Hospitals ' + (room.name ? 'around ' + room.name : 'near by.');
		break;
	case 'restaurant':
		name = 'Restaurants ' + (room.name ? 'around ' + room.name : 'near by.');
		break;
	}

	return new Thread({
		id,
		type: TYPE_THREAD,
		name,
		body: name,
		parents: [ room.id ],
		tags: [ TAG_POST_GAPI_SEED ],
		creator: 'bot',
		createTime: Date.now(),
	});
}

function buildTexts(place, thread) {
	const details = {
		name: place.details.name,
		website: place.details.website,
		address: place.details.formatted_address,
		phone: place.details.formatted_phone_number
	};

	const id = uuid.v4();
	const id2 = uuid.v4();
	const name = Object.keys(details).reduce((prev, cur) => {
		if (details[cur]) prev.push(cur + ': ' + details[cur]);
		return prev;
	}, []).join(', ');
	const url = 'c/' + id + '/image.jpg';

	const text = new Text({
		id: id2,
		type: TYPE_TEXT,
		body: name,
		parents: [ thread.id ],
		creator: 'bot',
		createTime: Date.now(),
		tags: [ TAG_POST_GAPI_SEED ]
	});

	if (!place.photo) {
		return Promise.resolve([ text ]);
	} else {
		return upload.urlTos3(place.photo.url, url).then(() => {
			const text2 = new Text({
				id,
				type: TYPE_TEXT,
				body: name,
				parents: [ thread.id ],
				creator: 'bot',
				createTime: Date.now(),
				tags: [ TAG_POST_GAPI_SEED ]
			});
			text.meta = {
				photo: {
					width: place.photo.width,
					height: place.photo.height,
					title: 'image.jpeg',
					type: 'photo'
				}
			};

			const thumbnail = getThumbnailObject('content', id, place.photo.width / place.photo.height);
			text.meta.photo.url = getImageUrl('content', id, 'image.jpeg', false);
			text.meta.photo.thumbnail_url = thumbnail.url;
			text.meta.photo.thumbnail_width = thumbnail.width;
			text.meta.photo.thumbnail_height = thumbnail.height;

			if (place.photo.attributions && place.photo.attributions.length) {
				const attributions = parseAttributions(place.photo.attributions[0]);
				text.meta.photo.author_name = attributions.author_name;
				text.meta.photo.author_url = attributions.author_url;
			}

			text.tags.push(TAG_POST_PHOTO);
			text.body = '📷 ' + text.meta.photo.url;
			return [ text, text2 ];
		});
	}
}

function getPlacesByType(room, type) {
	const geometry = room.params.placeDetails.geometry;
	return places.getNearByPlaces(
		geometry.location.lat,
		geometry.location.lng,
		2000,
		type
	).then(results => {
		const detailsPromises = [];

		results.slice(0, 4).forEach(result => {
			detailsPromises.push(places.getPlaceDetails(result.place_id));
		});

		return Promise.all(detailsPromises)
		.then(detailedPlaces => {
			const photoPromises = [];
			for (let i = 0; i < detailedPlaces.length; i++) {
				const place = detailedPlaces[i], details = {
						name: place.name,
						website: place.website,
						address: place.formatted_address,
						phone: place.formatted_phone_number
					};
				if (place.photos && place.photos.length) {
					photoPromises.push(places.getPhotoFromReference(place.photos[0].photo_reference, 960)
					.then(photo => ({
						details,
						photo: {
							attributions: place.photos[0].html_attributions,
							url: photo.location,
							width: 960,
							height: Math.floor(place.photos[0].height / place.photos[0].width * 960),
							reference: place.photos[0].photo_reference
						}
					})));
				} else {
					photoPromises.push(Promise.resolve({
						details,
						photo: null
					}));
				}
			}

			return Promise.all(photoPromises).then(res => [ type, res ]);
		});
	});
}

function buildChange(changes, room) {
	return Promise.all(types.map(e => {
		return getPlacesByType(room, e);
	})).then(results => {
		return results.reduce((prev, cur) => {
			prev[cur[0]] = cur[1];
			return prev;
		}, {});
	}).then((typeToContent) => {
		const promises = [];
		for (const i in typeToContent) {
			const thread = buildThread(room, i);
			changes.entities[thread.id] = thread;
			for (const part of typeToContent[i]) {
				promises.push(buildTexts(part, thread));
			}
		}
		return Promise.all(promises).then(results => {
			return results.reduce((prev, cur) => {
				return prev.concat(cur);
			}, []).reduce((prev, cur) => {
				prev[cur.id] = cur;
				return prev;
			}, changes.entities);
		});
	});
}

function seedGAPIContent(room) {
	const geometry = room.params.placeDetails.geometry;
	if (geometry) {
		return buildChange({ entities: {} }, room);
	} else {
		return Promise.resolve({});
	}
}
//
// seedGAPIContent({
// 	name: 'paris',
// 	params: {
// 		placeDetails: {
// 			geometry: {
// 				location: {
// 					lat: 13.1315386,
// 					lng: 77.60205690000001
// 				}
// 			}
// 		}
// 	},
// 	id: 'skdjnckasjdnfaskdjn'
// }).then(changes => {
// 	console.log("final changes:", JSON.stringify(changes));
// }).catch(e => {
// 	log.error('final error',e.message);
// });

bus.on('postchange', (changes, next) => {
	const entities = changes && changes.entities || {};
	Object.keys(entities).filter(e => (
        entities[e].type === TYPE_ROOM && entities[e].createTime &&
        entities[e].createTime === entities[e].updateTime
	)).map(e => entities[e]).forEach((room) => {
		if (
			room.tags.indexOf(TAG_ROOM_CITY) === -1 &&
			room.tags.indexOf(TAG_ROOM_SPOT) === -1
		) {
			seedGAPIContent(room).then(finalChanges => {
				setTimeout(function(){
					bus.emit('change', finalChanges);
				}, 60 * 1000);

			});
		}

		seedContent(room);
	});
	next();
});

log.info('Content seeding module ready.');
