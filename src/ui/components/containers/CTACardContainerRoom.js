/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import CTACard from '../views/CTACard';

const mapSubscriptionToProps = {
	user: {
		key: 'me',
	},
	data: {
		key: {
			type: 'state',
			path: 'ctaroom',
		},
	},
};

const CTACardContainerRoom = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			...mapSubscriptionToProps,
			room: {
				key: {
					type: 'entity',
					id: props.room,
				},
			},
		}}
		passProps={props}
		component={CTACard}
	/>
);

CTACardContainerRoom.propTypes = {
	room: PropTypes.string,
};

export default CTACardContainerRoom;
