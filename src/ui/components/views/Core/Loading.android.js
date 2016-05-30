/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';

const {
	ProgressBarAndroid,
} = ReactNative;

type Props = {
	style?: any;
}

export default class Loading extends Component<void, Props, void> {
	static propTypes = {
		style: ProgressBarAndroid.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	setNativeProps(nativeProps: any) {
		this._root.setNativeProps(nativeProps);
	}

	_root: Object;

	render() {
		return <ProgressBarAndroid ref={c => (this._root = c)} style={this.props.style} />;
	}
}
