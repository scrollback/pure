/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import ReactNative from 'react-native';
import AppText from './AppText';
import TouchFeedback from './TouchFeedback';
import Colors from '../../../Colors';

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
		color: Colors.darkGrey,
		margin: 20,
		paddingHorizontal: 4,
	},
});

type Props = {
	onPress: Function;
	onRequestClose?: Function;
	children?: React.Element;
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

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

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
