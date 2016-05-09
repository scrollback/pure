/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import PassUserProp from '../../../modules/store/PassUserProp';
import Rooms from '../views/Homescreen/Rooms';

const mapSubscriptionToProps = {
	rooms: {
		key: {
			type: 'state',
			path: 'roomList',
		},
	},
};

const RoomsContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		passProps={props}
		component={Rooms}
	/>
);

export default PassUserProp(RoomsContainer);
