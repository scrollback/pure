/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppbarTouchable from '../Appbar/AppbarTouchable';
import AppbarIcon from '../Appbar/AppbarIcon';
import NotificationBadgeContainer from '../../containers/NotificationBadgeContainer';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	badge: {
		position: 'absolute',
		top: 10,
		right: 10,
		elevation: 2,
	},
});

type Props = {
	onNavigate: Function;
}

export default class NotificationIcon extends Component<void, Props, void> {
	static propTypes = {
		onNavigate: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handlePress: Function = () => {
		this.props.onNavigate({
			type: 'push',
			payload: { name: 'notes' },
		});
	};

	render() {
		return (
			<AppbarTouchable onPress={this._handlePress}>
				<View>
					<AppbarIcon name='notifications' />
					<NotificationBadgeContainer style={styles.badge} grouped />
				</View>
			</AppbarTouchable>
		);
	}
}
