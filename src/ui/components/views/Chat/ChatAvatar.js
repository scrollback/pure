/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AvatarRound from '../Avatar/AvatarRound';

const {
	StyleSheet,
	TouchableOpacity,
} = ReactNative;

const styles = StyleSheet.create({
	avatar: {
		position: 'absolute',
		top: 0,
		left: -36,
		alignSelf: 'flex-end',
	},
});

type Props = {
	user: string;
	onNavigate: Function;
};

export default class ChatAvatar extends Component<void, Props, void> {
	static propTypes = {
		user: PropTypes.string.isRequired,
		onNavigate: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: void): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_goToProfile = () => {
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
			<TouchableOpacity
				activeOpacity={0.5}
				onPress={this._goToProfile}
				style={styles.avatar}
			>
				<AvatarRound size={36} user={this.props.user} />
			</TouchableOpacity>
		);
	}
}
