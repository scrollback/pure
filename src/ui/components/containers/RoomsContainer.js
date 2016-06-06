/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import PassUserProp from '../../../modules/store/PassUserProp';
import Rooms from '../views/Homescreen/Rooms';
import { TAG_USER_CONTENT, TAG_USER_ADMIN } from '../../../lib/Constants';

const isModerator = user => {
	return user && user.tags && (user.tags.indexOf(TAG_USER_ADMIN) > -1 || user.tags.indexOf(TAG_USER_CONTENT) > -1);
};

const mapSubscriptionToProps = {
	rooms: {
		key: {
			type: 'state',
			path: 'roomList',
		},
	},
	moderator: {
		key: 'me',
		transform: isModerator,
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
