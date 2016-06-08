/* @flow */

import createContainer from './createContainer';

const mapSubscriptionToProps = {
	user: {
		key: {
			type: 'state',
			path: 'user',
		}
	},
};

export default function() {
	return createContainer(mapSubscriptionToProps);
}
