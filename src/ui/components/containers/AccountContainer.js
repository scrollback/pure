/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import Account from '../views/Account/Account';
import { saveUser } from '../../../modules/store/actions';
import { bus } from '../../../core-client';

const mapActionsToProps = {
	saveUser: store => user => store.put(saveUser(user)),
	saveParams: (store, result) => params => store.put(saveUser({ ...result.user, params })),
	signOut: () => () => bus.emit('signout'),
};

const mapSubscriptionToProps = {
	user: {
		key: 'me',
	},
};

const AccountContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={Account}
	/>
);

export default AccountContainer;
