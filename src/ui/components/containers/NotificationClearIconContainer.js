/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import NotificationClearIcon from '../views/NotificationClearIcon';
import { dismissAllNotes } from '../../../modules/store/actions';

const mapActionsToProps = {
	dismissAllNotes: store => () => store.dispatch(dismissAllNotes()),
};

const NotificationClearIconContainer = (props: any) => (
	<Connect
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={NotificationClearIcon}
	/>
);

export default NotificationClearIconContainer;
