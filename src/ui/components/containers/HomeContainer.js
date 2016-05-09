/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import Home from '../views/Home';

const mapSubscriptionToProps = {
	initialURL: {
		key: {
			type: 'state',
			path: 'initialURL',
		},
	},
};

const HomeContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		passProps={props}
		component={Home}
	/>
);

export default HomeContainer;
