/* @flow */

import { bus, config } from '../../core-client';

const {
	server: {
		host,
		protocol,
	},
} = config;


bus.on('state:init', () => {
	const types = [ 'home', 'room' ];

	types.forEach(async type => {
		try {
			const res = await fetch(`${protocol}//${host}/s/cta_${type}.json`);
			const data = await res.json();

			bus.emit('change', {
				state: {
					['cta' + type]: data,
				},
			});
		} catch (e) {
			// ignore
		}
	});
});
