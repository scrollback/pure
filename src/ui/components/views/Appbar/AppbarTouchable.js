/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import TouchFeedback from '../Core/TouchFeedback';

const {
	View,
} = ReactNative;

type Props = {
	type?: 'primary' | 'secondary';
	onPress: Function;
	children?: React.Element;
}

export default class AppbarTouchable extends Component<void, Props, void> {
	static propTypes = {
		type: PropTypes.oneOf([ 'primary', 'secondary' ]),
		onPress: PropTypes.func.isRequired,
		children: PropTypes.node.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handlePress = () => {
		global.requestAnimationFrame(() => this.props.onPress());
	};

	render() {
		return (
			<TouchFeedback
				{...this.props}
				borderless
				pressColor={this.props.type === 'secondary' ? 'rgba(0, 0, 0, .15)' : 'rgba(255, 255, 255, .15)'}
				onPress={this._handlePress}
				delayPressIn={0}
			>
				<View>
					{this.props.children}
				</View>
			</TouchFeedback>
		);
	}
}
