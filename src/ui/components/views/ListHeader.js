/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import AppText from './AppText';
import Colors from '../../Colors';

const {
	View,
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	header: {
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	headerText: {
		color: Colors.fadedBlack,
		fontSize: 12,
		lineHeight: 18,
		fontWeight: 'bold',
	},
});

type Props = {
	children?: string;
}

export default class ListHeader extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.string.isRequired,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		const {
			children,
		} = this.props;

		return (
			<View style={styles.header}>
				<AppText style={styles.headerText}>{children && children.toUpperCase()}</AppText>
			</View>
		);
	}
}
