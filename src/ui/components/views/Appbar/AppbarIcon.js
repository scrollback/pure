/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import Icon from '../Core/Icon';
import Colors from '../../../Colors';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	icon: {
		margin: 16,
		color: Colors.white,
	},
});

type Props = {
	style?: any;
}

export default class AppbarIcon extends Component<void, Props, void> {
	static propTypes = {
		style: Icon.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<Icon
				{...this.props}
				style={[ styles.icon, this.props.style ]}
				size={24}
			/>
		);
	}
}
