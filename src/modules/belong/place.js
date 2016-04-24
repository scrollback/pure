/* @flow */

import { config } from '../../core-server';
import request from 'request';
import winston from 'winston';
import * as constants from '../../lib/Constants';

function getScore(types) {
	let finalScore, finalTag = null;
	for (const type of types) {
		let score, tag;
		if (type === 'locality') {
			tag = constants.TAG_ROOM_CITY;
			score = '1';
		} else if (type === 'sublocality' || type === 'neighborhood') {
			score = '2';
			tag = constants.TAG_ROOM_AREA;
		} else if (/.*sublocality.*/.test(type)) {
			score = '2' + type.match(/[0-9]/);
			tag = constants.TAG_ROOM_AREA;
		} else if (type === 'premise' || type === 'subpremise') {
			score = '3';
			tag = constants.TAG_ROOM_SPOT;
		}

		if (typeof score !== 'undefined' && (!finalScore || score > finalScore)) {
			finalScore = score;
			finalTag = tag;
		}
	}

	if (!finalTag || !finalScore) {
		return null;
	} else {
		return {
			score: finalScore,
			tag: finalTag
		};
	}
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
	return {
		identity: 'place:' + place.place_id,
		name: place.address_components? place.address_components[0].long_name : place.name,
		type: place.types[0] === 'locality' ?
			constants.TAG_ROOM_CITY : constants.TAG_ROOM_AREA,
		parents: place.parents
	};
}

export function getStubset(placeid: string, rel: number): Promise<Object> {
	let spot, score, tag;

	return callApi('place/details', { placeid })
	.then(place => {
		const scoreTag = getScore(place.types);

		spot = place;
		if (scoreTag) {
			score = scoreTag.score;
			tag = scoreTag.tag;
		}

		return callApi('geocode', {
			latlng: place.geometry.location.lat +
				',' + place.geometry.location.lng,
		});
	})
	.then(results => {
		if (!score) score = '3';
		let areas = results.filter(area => {
			const res = getScore(area.types);
			if (res) area.score = res.score;
			return res && res.score < score;
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
			areas[i].name = areas[i].name + (areas[i - 1] ? ', ' + areas[i - 1].name : '');
		}

		return { rel, stubs: areas };
	});
}
