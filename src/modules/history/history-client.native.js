/* @flow */

import ReactNative from 'react-native';
import { bus } from '../../core-client';

const {
	Linking,
} = ReactNative;

bus.on('state:init', () => {
	Linking.getInitialURL()
	.catch(() => null)
	.then(initialURL => {
		bus.emit('change', {
			state: {
				initialURL,
			},
		});
	});
});
