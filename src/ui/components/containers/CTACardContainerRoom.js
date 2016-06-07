/* @flow */

import createContainer from '../../../modules/store/createContainer';
import CTACard from '../views/Card/CTACard';

const mapSubscriptionToProps = ({ room }) => ({
	user: {
		key: 'me',
	},
	data: {
		key: {
			type: 'state',
			path: 'ctaroom',
		},
	},
	room: {
		key: {
			type: 'entity',
			id: room,
		},
	},
});

export default createContainer(mapSubscriptionToProps)(CTACard);
