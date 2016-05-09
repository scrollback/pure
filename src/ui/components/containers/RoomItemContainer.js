/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import RoomItem from '../views/Homescreen/RoomItem';

const RoomItemContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			room: {
				key: {
					type: 'entity',
					id: props.room,
				},
			},
		}}
		passProps={props}
		component={RoomItem}
	/>
);

RoomItemContainer.propTypes = {
	room: PropTypes.string,
};

export default RoomItemContainer;
