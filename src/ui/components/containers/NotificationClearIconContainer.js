/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import NotificationClearIcon from '../views/Notification/NotificationClearIcon';
import { dismissAllNotes } from '../../../modules/store/actions';

const mapActionsToProps = {
	dismissAllNotes: store => () => store.put(dismissAllNotes()),
};

const NotificationClearIconContainer = (props: any) => (
	<Connect
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={NotificationClearIcon}
	/>
);

export default NotificationClearIconContainer;
