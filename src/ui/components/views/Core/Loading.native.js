/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';

const {
	ActivityIndicator,
} = ReactNative;

type Props = {
	color?: string;
	size?: 'small' | 'large';
	style?: any;
}

export default class Loading extends Component<void, Props, void> {
	static propTypes = {
		color: PropTypes.string,
		size: ActivityIndicator.propTypes.size,
		style: ActivityIndicator.propTypes.style,
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
			<ActivityIndicator
				ref={c => (this._root = c)}
				color={this.props.color}
				size={this.props.size}
				style={this.props.style}
			/>
		);
	}
}
