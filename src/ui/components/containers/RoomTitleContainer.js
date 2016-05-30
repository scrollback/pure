/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import AppbarTitle from '../views/Appbar/AppbarTitle';

const transformTitle = room => {
	if (room && room.type === 'loading') {
		return 'Loading…';
	} else if (room && room.name) {
		return room.name;
	} else {
		return '…';
	}
};

const RoomTitleContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			title: {
				key: {
					type: 'entity',
					id: props.room,
				},
				transform: transformTitle,
			},
		}}
		passProps={props}
		component={AppbarTitle}
	/>
);

RoomTitleContainer.propTypes = {
	room: PropTypes.string.isRequired,
};

export default RoomTitleContainer;
