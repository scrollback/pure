/* @flow */

import ReactNative from 'react-native';
import { bus } from '../../core-client';

const {
	Linking,
} = ReactNative;

bus.on('state:init', () => {
	setTimeout(() => {
		// FIXME:
		// currentActivity is undefined on native side
		// If we put a delay, it somehow gets fixed
		Linking.getInitialURL()
		.catch(() => null)
		.then(initialURL => {
			bus.emit('change', {
				state: {
					initialURL,
				},
			});
		});
	}, 300);
});
