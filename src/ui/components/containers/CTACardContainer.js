/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import CTACard from '../views/CTACard';

const mapSubscriptionToProps = {
	user: {
		key: 'me',
	},
};

const CTACardContainer = (props: any) => (
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

CTACardContainer.propTypes = {
	room: PropTypes.string,
};

export default CTACardContainer;
