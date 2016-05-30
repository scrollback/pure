/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import Colors from '../../../Colors';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	title: {
		color: Colors.white,
		fontWeight: 'bold',
		fontSize: 18,
		lineHeight: 27,
		marginVertical: 14,
		marginRight: 64,
		paddingHorizontal: 4,
	},
});

type Props = {
	title: string
}

export default class AppbarTitle extends Component<void, Props, void> {
	static propTypes = {
		title: PropTypes.string.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<AppText numberOfLines={1} style={styles.title}>
				{this.props.title}
			</AppText>
		);
	}
}
