/* @flow */

import React, { PropTypes, Component } from 'react';
import Connect from '../../../modules/store/Connect';
import UserSwitcher from '../views/UserSwitcher';
import { bus } from '../../../core-client';
import { initializeSession } from '../../../modules/store/actions';


type Props = {
	user: string;
	data: ?Array<{ user: string; session: string }>;
	switchUser: Function;
}

class UserSwitcherContainerInner extends Component<void, Props, void> {
	static propTypes = {
		data: PropTypes.arrayOf(PropTypes.shape({
			user: PropTypes.string,
			session: PropTypes.string,
		})),
		user: PropTypes.string.isRequired,
		switchUser: PropTypes.func.isRequired,
	};

	render() {
		const {
			data,
			user,
		} = this.props;

		if (data) {
			return (
				<UserSwitcher
					{...this.state}
					{...this.props}
					user={user}
				/>
			);
		}

		return null;
	}
}

const mapSubscriptionToProps = {
	user: {
		key: {
			type: 'state',
			path: 'user',
		},
	},
	data: {
		key: {
			type: 'state',
			path: 'sessionList',
		},
	},
};

const mapActionsToProps = {
	switchUser: (store, result) => item => {
		bus.emit('signout');

		const { me } = result;

		if (me && me.id === item.user) {
			return;
		}

		store.put(initializeSession(item.session));
	},
};

const UserSwitcherContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={UserSwitcherContainerInner}
	/>
);

export default UserSwitcherContainer;
