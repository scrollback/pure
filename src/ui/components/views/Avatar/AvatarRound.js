/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import Colors from '../../../Colors';
import AvatarContainer from '../../containers/AvatarContainer';

const {
	PixelRatio,
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	avatar: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: Colors.primary,
	},

	letter: {
		color: Colors.white,
	},

	image: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		resizeMode: 'cover',
	},
});

type Props = {
	user: string;
	size: number;
	style?: any;
}

export default class AvatarRound extends Component<void, Props, void> {
	static propTypes = {
		size: PropTypes.number.isRequired,
		user: PropTypes.string.isRequired,
		style: View.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		const {
			user,
			size,
		} = this.props;

		return (
			<View {...this.props} style={[ styles.avatar, { height: size, width: size, borderRadius: size / 2 }, this.props.style ]}>
				<AppText style={[ styles.letter, { fontSize: size / 2, top: -(size / 72) } ]}>{user.charAt(0).toUpperCase()}</AppText>
				<AvatarContainer
					size={this.props.size * PixelRatio.get()}
					user={this.props.user}
					style={[ styles.image, { borderRadius: size / 2 } ]}
				/>
			</View>
		);
	}
}
