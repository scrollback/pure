/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import AppText from './AppText';

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

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		return (
			<AppText numberOfLines={1} style={styles.title}>
				{this.props.title}
			</AppText>
		);
	}
}
