/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import PassUserProp from '../../../modules/store/PassUserProp';
import NotificationBadge from '../views/NotificationBadge';

const transformNotesToCount = (/* data */) => {
	// TODO: handle notifications properly
	// if (data && data.length) {
	// 	if (data.length === 1 && data[0] && data[0].type === 'loading') {
	// 		return 0;
	// 	} else {
	// 		return data.length;
	// 	}
	// } else {
	// 	return 0;
	// }
	return 0;
};

const NotificationBadgeContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			count: {
				key: {
					slice: {
						type: 'note',
						filter: {
							user: props.user,
						},
						order: 'updateTime',
					},
					range: {
						start: Infinity,
						before: 100,
						after: 0,
					},
				},
				transform: transformNotesToCount,
			},
		}}
		passProps={props}
		component={NotificationBadge}
	/>
);

NotificationBadgeContainer.propTypes = {
	user: PropTypes.string.isRequired,
};

export default PassUserProp(NotificationBadgeContainer);
