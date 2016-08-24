import log from 'winston';
import uuid from 'node-uuid';
import { bus, config } from '../../core-server';
import Thread from '../../models/thread';
import Text from '../../models/text';
import Room from '../../models/room';
import * as places from '../../lib/places';
import * as upload from '../../lib/upload';

import { TYPE_ROOM,
	TYPE_TEXT,
	TYPE_THREAD,
	TAG_POST_PHOTO,
	TAG_ROOM_CITY,
	TAG_POST_GAPI_SEED,
} from '../../lib/Constants';

const botName = 'belongbot';
const types = [ 'hospital', 'restaurant', 'school', 'grocery_or_supermarket' ];

function parseAttributions(html) {
	return {
		author_url: html.match(/"(.*?)"/)[1],
		author_name: html.match(/>(.*?)</)[1]
	};
}

function getThumbnailObject(type, id, aspectRatio) {
	const baseUrl = 'https://' + (config.s3.generateHostname || (config.s3.generateBucket + '.s3.amazonaws.com')) + '/';
	let url, width, height;

	switch (type) {
	case 'avatar':
		url = baseUrl + 'a/' + id + '/256.jpeg';
		width = 256;
		height = 256;
		break;
	case 'content':
	case 'banner':
		url = baseUrl + (type === 'banner' ? 'b' : 'c') + '/' + id + '/480.jpeg';
		width = 480;
		height = Math.floor(480 / aspectRatio);
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
		creator: botName,
		createTime: Date.now(),
	});
}

async function buildTexts(place, thread) {
	const texts = [];
	const details = {
		name: place.details.name,
		website: place.details.website,
		address: place.details.formatted_address,
		phone: place.details.formatted_phone_number
	};

	const id = uuid.v4();
	const id2 = uuid.v4();
	const name = Object.keys(details).reduce((prev, cur) => {
		if (details[cur]) prev.push(details[cur]);
		return prev;
	}, []).join(', ');
	const url = 'c/' + id + '/image.jpeg';

	const text = new Text({
		id: id2,
		type: TYPE_TEXT,
		name: '',
		body: name,
		parents: [ thread.id ],
		creator: botName,
		createTime: Date.now(),
		tags: [ TAG_POST_GAPI_SEED ]
	});

	texts.push(text);
	if (!place.photo) {
		return texts;
	} else {
		let text2;
		try {
			await upload.urlTos3(place.photo.url, url);
			text2 = new Text({
				id,
				type: TYPE_TEXT,
				name: '',
				body: name,
				parents: [ thread.id ],
				creator: botName,
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
			texts.push(text2);
		} catch (e) {
			text2 = null;
		}

		return texts;
	}
}


async function getPlacesByType(room, type) {
	const geometry = room.params.placeDetails.geometry;
	const results = await places.getNearByPlaces(
		geometry.location.lat,
		geometry.location.lng,
		2000,
		type
	);

	const detailsPromises = [];
	results.slice(0, 4).forEach(result => {
		detailsPromises.push(places.getPlaceDetails(result.place_id));
	});

	const detailedPlaces = await Promise.all(detailsPromises);

	const photoPromises = [];
	for (let i = 0; i < detailedPlaces.length; i++) {
		const place = detailedPlaces[i], details = {
				name: place.name,
				website: place.website,
				address: place.formatted_address,
				phone: place.formatted_phone_number
			};

		photoPromises.push((async function() {
			if (place.photos && place.photos.length) {
				const photo = await places.getPhotoFromReference(place.photos[0].photo_reference, 960);

				return {
					details,
					photo: {
						attributions: place.photos[0].html_attributions,
						url: photo.location,
						width: 960,
						height: Math.floor(place.photos[0].height / place.photos[0].width * 960),
						reference: place.photos[0].photo_reference
					}
				};
			} else {
				return {
					details,
					photo: null
				};
			}
		}()));
	}

	const content = await Promise.all(photoPromises);

	return {
		type,
		content
	};
}


function seedRoom(room) {
	types.forEach(async e => {
		const changes = {
			entities: {},
			source: 'belong'
		};
		const nearByPlaces = await getPlacesByType(room, e);
		const thread = buildThread(room, nearByPlaces.type);

		thread.createTime = thread.updateTime = Date.now();
		changes.entities[thread.id] = thread;

		const promises = nearByPlaces.content.map(place => {
			return buildTexts(place, thread);
		});

		const results = await Promise.all(promises);


		let texts = results.reduce((prev, cur) => {
			return prev.concat(cur);
		}, []);

		texts = texts.reduce((prev, cur) => {
			prev[cur.id] = cur;
			return prev;
		}, changes.entities);


		let time = Date.now();
		for (const i in changes.entities) {
			const newEntity = changes.entities[i];
			if (newEntity.type === TYPE_THREAD) {
				newEntity.createTime = newEntity.updateTime = ++time;
			}
		}


		for (const i in changes.entities) {
			const newEntity = changes.entities[i];
			if (newEntity.type === TYPE_TEXT) {
				newEntity.createTime = newEntity.updateTime = ++time;
			}
		}

		setTimeout(() => {
			bus.emit('change', changes);
		}, 6000);
	});
}

function seedGAPIContent(room) {
	const geometry = room.params.placeDetails.geometry;
	if (
		room.tags &&
		room.tags.indexOf(TAG_ROOM_CITY) === -1 &&
		room.tags.indexOf(TAG_ROOM_CITY) === -1 &&
		geometry
	) {
		seedRoom(room);
	}
}

async function addParams(room) {
	return places.getPlaceDetails(room.identities[0].replace(/^place:/, ''))
	.then(e => {
		const newRoom = {
			...room
		};
		newRoom.params = newRoom.params || {};
		newRoom.params.placeDetails = e;
		delete e.address_components;
		if (e.photos && e.photos.length) e.photos = e.photos.slice(0, 1);
		return new Room(newRoom);
	}).catch(e => {
		log.warn('Error in getting meta data: ', e.message);
	});
}

async function addMeta(room) {
	const params = room.params;
	if (
		params.placeDetails &&
		params.placeDetails.photos &&
		params.placeDetails.photos.length
	) {
		const reference = params.placeDetails.photos[0].photo_reference;
		try {
			const photo = await places.getPhotoFromReference(reference, 300);
			room.meta = room.meta || {};
			room.meta.photo = room.meta.photo || {};
			room.meta.photo.attributions = params.placeDetails.photos[0].html_attributions;
			room.meta.photo.height = params.placeDetails.photos[0].height;
			room.meta.photo.width = params.placeDetails.photos[0].width;
			await upload.urlTos3(photo.location, 'b/' + room.id + '/image.jpg');
			return room;
		} catch (e) {
			room.meta.photo.url = 'b/' + room.id + '/image.jpg';
			return room;
		}
	}

	return room;
}

function saveEntity(entity) {
	bus.emit('change', {
		entities: {
			[entity.id]: entity
		},
		source: 'belong'
	});

	seedGAPIContent(entity);
}

bus.on('postchange', async changes => {
	if (!changes.entities) return;

	for (const i in changes.entities) {
		const entity = changes.entities[i];

		if (entity.type !== TYPE_ROOM ||
			!entity.createTime ||
			entity.createTime !== entity.updateTime ||
			!entity.identities ||
			!entity.identities.length
		) continue;

		const newEntity = await addParams(entity); // eslint-disable-line babel/no-await-in-loop
		await addMeta(newEntity); // eslint-disable-line babel/no-await-in-loop
		saveEntity(newEntity);
	}
});
