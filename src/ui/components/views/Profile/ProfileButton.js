/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppbarTouchable from '../Appbar/AppbarTouchable';
import AvatarRound from '../Avatar/AvatarRound';
import Colors from '../../../Colors';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	avatar: {
		borderColor: Colors.white,
		borderWidth: 1,
		margin: 13,
	},
});

type Props = {
	user: string;
	onNavigate: Function;
}

export default class ProfileButton extends Component<void, Props, void> {
	static propTypes = {
		user: PropTypes.string.isRequired,
		onNavigate: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handlePress = () => {
		this.props.onNavigate({
			type: 'PUSH_ROUTE',
			payload: {
				name: 'profile',
				props: {
					user: this.props.user,
				},
			},
		});
	};

	render() {
		return (
			<AppbarTouchable onPress={this._handlePress}>
				<AvatarRound
					user={this.props.user}
					style={styles.avatar}
					size={30}
				/>
			</AppbarTouchable>
		);
	}
}
