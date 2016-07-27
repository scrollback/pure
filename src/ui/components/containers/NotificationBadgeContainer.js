/* @flow */

import React, { Component } from 'react';
import { DeviceEventEmitter } from 'react-native';
import GCM from '../../modules/GCM';
import NotificationBadge from '../views/Notification/NotificationBadge';

type State = {
	count: number;
}

export default class NotificationBadgeContainer extends Component<void, any, State> {

	state: State = {
		count: 0,
	};

	componentDidMount() {
		this._updateData();

		this._subscription = DeviceEventEmitter.addListener('GCMDataUpdate', () => {
			this._updateData();
		});
	}

	componentWillUnmount() {
		this._subscription.remove();
	}

	_subscription: any;

	_updateData = async () => {
		const data = await GCM.getCurrentNotifications();

		if (data) {
			this.setState({
				count: data.filter(note => !note.readTime).length,
			});
		}
	};

	render() {
		return (
			<NotificationBadge
				{...this.props}
				count={this.state.count}
			/>
		);
	}
}
