/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import BannerOffline from '../views/Banner/BannerOffline';

const mapSubscriptionToProps = {
	status: {
		key: {
			type: 'state',
			path: 'connectionStatus',
		},
	},
};

const BannerOfflineContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		passProps={props}
		component={BannerOffline}
	/>
);

export default BannerOfflineContainer;
