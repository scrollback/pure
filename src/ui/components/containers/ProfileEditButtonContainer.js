
/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import ProfileEditButton from '../views/Profile/ProfileEditButton';

const mapSubscriptionToProps = {
	currentUser: {
		key: {
			type: 'state',
			path: 'user',
		},
	},
};

const ProfileEditButtonContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		passProps={props}
		component={ProfileEditButton}
	/>
);

export default ProfileEditButtonContainer;
