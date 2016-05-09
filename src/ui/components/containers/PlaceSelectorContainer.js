/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import PlacesSelector from '../views/Account/PlacesSelector';

const mapSubscriptionToProps = {
	location: {
		key: {
			type: 'state',
			path: 'location',
		},
	},
};

const PlaceSelectorContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		passProps={props}
		component={PlacesSelector}
	/>
);

export default PlaceSelectorContainer;
