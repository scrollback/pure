/* @flow */

import React, { PropTypes, Component } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import SignIn from './SignIn';
import UserDetails from './UserDetails';
import PlacesDetails from './PlacesDetails';
import GetStarted from './GetStarted';
import Home from '../Home';

type Props = {
	page: 'PAGE_SIGN_IN' | 'PAGE_USER_DETAILS' | 'PAGE_PLACES' | 'PAGE_GET_STARTED' | 'PAGE_HOME' | 'PAGE_LOADING';
}

export default class Onboard extends Component<void, Props, void> {
	static propTypes = {
		page: PropTypes.string,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		const { props } = this;

		switch (props.page) {
		case 'PAGE_SIGN_IN':
			return <SignIn {...props} />;
		case 'PAGE_USER_DETAILS':
			return <UserDetails {...props} />;
		case 'PAGE_PLACES':
			return <PlacesDetails {...props} />;
		case 'PAGE_GET_STARTED':
			return <GetStarted {...props} />;
		case 'PAGE_HOME':
			return <Home {...props} />;
		default:
			return null;
		}
	}
}
