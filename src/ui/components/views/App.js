/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowEqual from 'shallowequal';
import Splash from './Splash';
import OnboardContainer from '../containers/OnboardContainer';
import Offline from './Offline';

type Props = {
	connection: 'connecting' | 'online' | 'offline';
	session: string;
	user: string;
}

export default class App extends Component<void, Props, void> {
	static propTypes = {
		connection: PropTypes.oneOf([ 'connecting', 'online', 'offline' ]),
		session: PropTypes.string,
		user: PropTypes.string,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		const {
			connection,
			session,
			user,
		} = this.props;

		const loading = session === '@@loading' || session && !user;

		if (loading) {
			switch (connection) {
			case 'offline':
				return <Offline />;
			default:
				return <Splash />;
			}
		} else {
			return <OnboardContainer {...this.props} />;
		}
	}
}
