/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import Icon from '../Core/Icon';
import Colors from '../../../Colors';

const {
	StyleSheet,
	TouchableOpacity,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 8,
		height: 56,
	},

	label: {
		fontSize: 12,
		lineHeight: 18,
		fontWeight: 'bold',
		color: Colors.info,
	},

	hint: {
		fontSize: 12,
		lineHeight: 18,
		color: Colors.info,
	},

	iconContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 36,
		width: 36,
		borderRadius: 18,
		backgroundColor: Colors.info,
		marginHorizontal: 16,
	},

	icon: {
		color: Colors.white,
	},

	labelContainer: {
		flex: 1,
	},
});

type Props = {
	label: string;
	type: string;
	hint: string;
	onPress: Function;
}

export default class PlaceButton extends Component<void, Props, void> {
	static propTypes = {
		label: PropTypes.string.isRequired,
		hint: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		onPress: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handlePress = () => {
		global.requestAnimationFrame(() =>	this.props.onPress(this.props.type));
	};

	render() {
		return (
			<TouchableOpacity {...this.props} onPress={this._handlePress}>
				<View style={styles.container}>
				<View style={styles.iconContainer}>
					<Icon
						style={styles.icon}
						name='add'
						size={16}
					/>
				</View>
				<View style={styles.labelContainer}>
					<AppText style={styles.label} numberOfLines={1}>{this.props.label.toUpperCase()}</AppText>
					<AppText style={styles.hint} numberOfLines={1}>{this.props.hint}</AppText>
				</View>
				</View>
			</TouchableOpacity>
		);
	}
}
