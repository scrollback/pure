/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import PassUserProp from '../../../modules/store/PassUserProp';
import App from '../views/App';

const mapSubscriptionToProps = {
	connection: {
		key: {
			type: 'state',
			path: 'connectionStatus',
		},
	},
	session: {
		key: {
			type: 'state',
			path: 'session',
		},
	},
};

const AppContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		passProps={props}
		component={App}
	/>
);

export default PassUserProp(AppContainer);
