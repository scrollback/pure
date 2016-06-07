/* @flow */

import createContainer from '../../../modules/store/createContainer';
import CTACard from '../views/Card/CTACard';

const mapSubscriptionToProps = {
	user: {
		key: 'me',
	},
	data: {
		key: {
			type: 'state',
			path: 'ctahome',
		},
	},
};

export default createContainer(mapSubscriptionToProps)(CTACard);
