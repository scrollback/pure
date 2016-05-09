/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import VersionCodes from '../../modules/VersionCodes';

const {
	TouchableNativeFeedback,
	TouchableHighlight,
	Platform,
} = ReactNative;

type Props = {
	borderless?: boolean;
	pressColor?: string;
	children?: Element
}

export default class TouchFeedback extends Component<void, Props, void> {
	static propTypes = {
		borderless: PropTypes.bool,
		pressColor: PropTypes.string,
		children: PropTypes.node.isRequired,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		if (Platform.OS === 'android' && Platform.Version >= VersionCodes.LOLLIPOP) {
			return (
				<TouchableNativeFeedback {...this.props} background={TouchableNativeFeedback.Ripple(this.props.pressColor, this.props.borderless)}>
					{this.props.children}
				</TouchableNativeFeedback>
			);
		} else {
			return (
				<TouchableHighlight {...this.props} underlayColor={this.props.pressColor || 'rgba(0, 0, 0, .12)'}>
					{this.props.children}
				</TouchableHighlight>
			);
		}
	}
}
