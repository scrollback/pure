/* @flow */

import createContainer from './createContainer';

function mapSubscriptionToProps() {
	return {
		user: {
			key: {
				type: 'state',
				path: 'user',
			}
		},
	};
}

export default function() {
	return createContainer(mapSubscriptionToProps);
}
