/* @flow */

import { config } from '../../core-server';
import request from 'request';
import winston from 'winston';
import * as constants from '../../lib/Constants';

function getScore(types) {
	let finalScore, finalTag = null;
	for (const type of types) {
		let score, tag;

		switch (type) {
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
		case 'country':
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

function callApi(api, params) {
	return new Promise((resolve, reject) => {
		request(
			'https://maps.googleapis.com/maps/api/' + api +
			'/json?key=' + config.google.api_key + '&' +

			/* $FlowFixMe : We don't need all keys to be present */
			Object.keys(params).map(name => name + '=' + params[name])
			.join('&'),
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

function placeToStub(place) {
	const { tag } = getScore(place.types);
	return {
		identity: 'place:' + place.place_id,
		name: place.name ? place.name : place.address_components && place.address_components[0].long_name,
		type: tag,
		parents: place.parents,
	};
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
