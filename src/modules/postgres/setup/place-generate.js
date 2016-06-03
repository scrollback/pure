import { config } from '../../../core-server';
import fs from 'fs';
import raw from './place-raw';
import request from 'request';
import * as constants from '../../../lib/Constants';


let output = fs.createWriteStream("./places.csv");

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
					return reject(
						'GAPI ' + api + ' HTTP ERROR: ' + error.message
					);
				}

				let res;

				try { res = JSON.parse(body); } catch (e) {
					return reject('GAPI ' + api + ' PARSE ERROR: ' + e.message);
				}

				if (res.status !== 'OK') {
					return reject('GAPI ' + api + ' STATUS: ' + res.status);
				}

				return resolve(res.results || res.result);
			}
		);
	});
}

function process(i) {
	callApi("geocode", {
		bounds: (raw[i].lat - 0.1) + "," + (raw[i].lon - 0.1) + "|" +
			(raw[i].lat + 0.1) + "," + (raw[i].lon + 0.1),
		address: raw[i].id.replace(/\-/g, " ")
	}).then(results => {
		results.forEach(result => {
			output.write(
				raw[i].id + "\t" +
				result.address_components[0].long_name + "\t" +
				result.formatted_address + "\t" +
				result.place_id + "\t" +
				( result.types.indexOf("sublocality") >= 0 ?
					constants.TAG_ROOM_AREA :
					result.types.indexOf("locality") >= 0 ?
						constants.TAG_ROOM_CITY :
						constants.TAG_ROOM_SPOT ) +
				"\n"
			);
		});
		console.log("Got " + results.length + " results for " + raw[i].id);
		if (i < raw.length - 1) setTimeout(() => process(i + 1), 1000);
	}).catch(err => {
		console.error(raw[i].id, err);
		if (i < raw.length - 1) setTimeout(() => process(i + 1), 1000);
	});
}

process(0);
