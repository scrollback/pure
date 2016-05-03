/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import CTACard from '../views/CTACard';

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

const CTACardContainerHome = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		passProps={props}
		component={CTACard}
	/>
);

export default CTACardContainerHome;
