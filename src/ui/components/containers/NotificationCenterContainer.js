/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import PassUserProp from '../../../modules/store/PassUserProp';
import NotificationCenter from '../views/Notification/NotificationCenter';
import { dismissNote } from '../../../modules/store/actions';

const mapActionsToProps = {
	dismissNote: store => id => store.put(dismissNote(id)),
};

const NotificationCenterContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			data: {
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
				transform: () => [], // TODO: handle notifications properly
			},
		}}
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={NotificationCenter}
	/>
);

NotificationCenterContainer.propTypes = {
	user: PropTypes.string,
};

export default PassUserProp(NotificationCenterContainer);
