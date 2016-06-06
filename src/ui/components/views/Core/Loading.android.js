/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';

const {
	ActivityIndicator,
} = ReactNative;

type Props = {
	style?: any;
}

export default class Loading extends Component<void, Props, void> {
	static propTypes = {
		style: ActivityIndicator.propTypes.style,
		color: PropTypes.string,
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
				style={this.props.style}
				color={this.props.color}
			/>
		);
	}
}
