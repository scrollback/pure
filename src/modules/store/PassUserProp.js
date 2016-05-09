/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowEqual from 'shallowequal';
import Connect from './Connect';

const mapSubscriptionToProps = {
	user: {
		key: {
			type: 'state',
			path: 'user',
		},
	},
};

export default function(component: ReactClass<any>): ReactClass<any> {
	class PassUserProp extends Component<void, any, void> {
		static propTypes = {
			user: PropTypes.string,
		};

		shouldComponentUpdate(nextProps: any): boolean {
			return !shallowEqual(this.props, nextProps);
		}

		render() {
			return (
				<Connect
					mapSubscriptionToProps={mapSubscriptionToProps}
					passProps={this.props}
					component={component}
				/>
			);
		}
	}

	return PassUserProp;
}
