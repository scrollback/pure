/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import AppText from './AppText';
import AvatarRound from './AvatarRound';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	author: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	name: {
		flex: 1,
		color: Colors.grey,
		fontSize: 12,
		lineHeight: 18,
		marginHorizontal: 8,
	},
});

type Props = {
	nick: string;
	style?: any;
}

export default class CardAuthor extends Component<void, Props, void> {
	static propTypes = {
		nick: PropTypes.string.isRequired,
		style: View.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		const { nick } = this.props;

		return (
			<View {...this.props} style={[ styles.author, this.props.style ]}>
				<AvatarRound
					size={24}
					user={nick}
				/>
				<AppText style={styles.name}>{nick}</AppText>
			</View>
		);
	}
}
