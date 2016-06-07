/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import AppbarTouchable from '../Appbar/AppbarTouchable';
import AppbarIcon from '../Appbar/AppbarIcon';

type Props = {
	user: string;
	currentUser: string;
	onNavigate: Function;
}

export default class AccountButton extends Component<void, Props, void> {
	static propTypes = {
		user: PropTypes.string.isRequired,
		currentUser: PropTypes.string.isRequired,
		onNavigate: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handlePress: Function = () => {
		this.props.onNavigate({
			type: 'push',
			payload: {
				name: 'account',
			},
		});
	};

	render() {
		const {
			user,
			currentUser,
		} = this.props;

		if (user !== currentUser) {
			return null;
		}

		return (
			<AppbarTouchable onPress={this._handlePress}>
				<AppbarIcon name='settings' />
			</AppbarTouchable>
		);
	}
}
