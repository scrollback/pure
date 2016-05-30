/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import Icon from '../Core/Icon';
import Colors from '../../../Colors';

const {
	View,
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	label: {
		color: Colors.white,
		fontWeight: 'bold',
		margin: 16,
	},

	icon: {
		color: Colors.fadedBlack,
	},
});

type Props = {
	label: string;
	style?: any;
}

export default class NextButtonLabel extends Component<void, Props, void> {
	static propTypes = {
		label: PropTypes.string.isRequired,
		style: View.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	setNativeProps(nativeProps: any) {
		this._root.setNativeProps(nativeProps);
	}

	_root: Object;

	render() {
		return (
			<View {...this.props} ref={c => (this._root = c)}>
				<AppText style={styles.label}>{this.props.label.toUpperCase()}</AppText>
				<Icon
					style={styles.icon}
					name='arrow-forward'
					size={16}
				/>
			</View>
		);
	}
}
