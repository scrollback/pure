/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import AppText from './AppText';
import TouchFeedback from './TouchFeedback';
import Colors from '../../Colors';

const {
	View,
	StyleSheet,
	PixelRatio,
} = ReactNative;

const styles = StyleSheet.create({
	menuItem: {
		borderColor: Colors.separator,
		borderTopWidth: 1 / PixelRatio.get(),
	},
	menuItemText: {
		fontSize: 16,
		lineHeight: 24,
		color: Colors.darkGrey,
		margin: 20,
		paddingHorizontal: 4,
	},
});

type Props = {
	onPress: Function;
	onRequestClose?: Function;
	children?: any;
}

export default class ActionSheetItem extends Component<void, Props, void> {
	static propTypes = {
		onPress: PropTypes.func.isRequired,
		onRequestClose: PropTypes.func,
		children: PropTypes.string.isRequired,
	};

	_handlePress: Function = () => {
		global.requestAnimationFrame(() => {
			this.props.onPress();

			if (this.props.onRequestClose) {
				this.props.onRequestClose();
			}
		});
	};

	render() {
		return (
			<TouchFeedback {...this.props} onPress={this._handlePress}>
				<View style={styles.menuItem}>
					<AppText style={styles.menuItemText}>{this.props.children}</AppText>
				</View>
			</TouchFeedback>
		);
	}
}
