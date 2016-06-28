import { config } from '../core-server';
import request from 'request';
import winston from 'winston';
import * as constants from '../lib/Constants';

function getScore(types) {
	let finalScore, finalTag = null;
	for (const type of types) {
		let score, tag;

		switch (type) {
		case 'country':
			tag = constants.TAG_ROOM_COUNTRY;
			score = 8;
			break;
		case 'administrative_area_level_3':
			tag = constants.TAG_ROOM_CITY;
			score = 9;
			break;
		case 'locality':
			tag = constants.TAG_ROOM_CITY;
			score = 10;
			break;
		case 'sublocality':
			tag = constants.TAG_ROOM_AREA;
			score = 20;
			break;
		case 'sublocality_level_4':
		case 'sublocality_level_5':
		case 'sublocality_level_3':
		case 'sublocality_level_2':
		case 'sublocality_level_1':
			tag = constants.TAG_ROOM_AREA;
			score = 20 + parseInt(type.substr(-1), 10);
			break;
		case 'colloquial_area':
			tag = constants.TAG_ROOM_AREA;
			score = 25;
			break;
		case 'neighborhood':
			tag = constants.TAG_ROOM_AREA;
			score = 26;
			break;
		case 'administrative_area_level_1':
		case 'administrative_area_level_2':
		case 'administrative_area_level_4':
		case 'administrative_area_level_5':
		case 'natural_feature':
		case 'political':
		case 'post_box':
		case 'postal_code':
		case 'postal_code_prefix':
		case 'postal_code_suffix':
		case 'postal_town':
		case 'subpremise':
		case 'floor':
		case 'room':
		case 'route':
		case 'intersection':
		case 'geocode':
		case 'street_address':
		case 'street_number':
			score = 0;
			tag = 0;
			break; /* ignore these */
		default:
			tag = constants.TAG_ROOM_SPOT;
			score = 30;
		}

		if (!finalScore || score > finalScore) {
			finalScore = score;
			finalTag = tag;
		}
	}

	return {
		score: finalScore,
		tag: finalTag,
	};
}


function handleError(message, reject) {
	winston.error(message);
	reject(new Error(message));
	return;
}

export function callApi(api: string, params: Object) {
	return new Promise((resolve, reject) => {
		const p = 'https://maps.googleapis.com/maps/api/' + api +
		'/json?key=' + config.google.api_key + '&' +
		Object.keys(params).map(name => name + '=' + params[name])
		.join('&');

		request(
			p,
			(error, response, body) => {
				if (error) {
					return handleError(
						'GAPI ' + api + ' HTTP ERROR: ' + error.message, reject
					);
				}

				let res;

				try { res = JSON.parse(body); } catch (e) {
					return handleError('GAPI ' + api + ' PARSE ERROR: ' + e.message, reject);
				}

				if (res.status !== 'OK') {
					return handleError('GAPI ' + api + ' STATUS: ' + res.status, reject);
				}

				return resolve(res.results || res.result);
			}
		);
	});
}

export function getPhotoFromReference(photoreference: string, maxwidth: number) {
	return new Promise((resolve, reject) => {
		const params = {
			key: config.google.api_key,
			photoreference,
			maxwidth
		};
		const p = 'https://maps.googleapis.com/maps/api/place/photo?' +
		Object.keys(params).map(name => name + '=' + params[name])
		.join('&');

		request({
			url: p,
			followRedirect: false
		},
			(error, response) => {
				if (error) {
					return handleError(
						'GAPI  HTTP ERROR: ' + error.message, reject
					);
				}

				return resolve({
					location: response.headers.location
				});
			}
		);
	});
}

export function getNearByPlaces(lat: number, long: number, radius: number, type: string) {
	return callApi('place/nearbysearch', {
		location: lat + ',' + long,
		radius,
		type
	});
}

export function getPlaceDetails(placeid) {
	return callApi('place/details', {
		placeid
	});
}

function placeToStub(place) {
	const { tag } = getScore(place.types);
	const stub = {
		identity: 'place:' + place.place_id,
		name: place.name ? place.name : place.address_components && place.address_components[0].long_name,
		type: tag,
		parents: place.parents,
		meta: {
			geometry: place.geometry,
			photos: place.photos
		}
	};

	if ('photos' in place) stub.meta.photos = place.photos;
	return stub;
}

export function getStubset(placeid: string, rel: number): Promise<Object> {
	let spot, score, tag;

	return callApi('place/details', { placeid })
	.then(place => {
		const scoreTag = getScore(place.types);

		spot = place;
		score = scoreTag.score;
		tag = scoreTag.tag;

		return callApi('geocode', {
			latlng: place.geometry.location.lat +
				',' + place.geometry.location.lng,
		});
	})
	.then(results => {
		if (!score) score = 30;
		let areas = results.filter(area => {
			const res = getScore(area.types);
			area.score = res.score;
			return res.score && res.score < score;
		});

		spot.score = score;
		let index = 0;

		if (tag) {
			for (const area of areas) {
				if (area.place_id === placeid) break;
				index++;
			}

			if (index === areas.length) areas.unshift(spot);
		}

		areas = areas.sort((a, b) => {
			return a.score < b.score ? -1 : 1;
		});

		const parents = [];

		for (let i = 0; i < areas.length; i++) {
			areas[i].parents = [].concat(parents);
			parents.push('place:' + areas[i].place_id);
		}

		areas = areas.map(placeToStub);

		for (let i = areas.length - 1; i > 0; i--) {
			areas[i].name += (areas[i - 1] ? ', ' + areas[i - 1].name : '');
		}

		return { rel, stubs: areas };
	});
}
