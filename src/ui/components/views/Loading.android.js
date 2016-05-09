/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';

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

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	setNativeProps(nativeProps: any) {
		this._root.setNativeProps(nativeProps);
	}

	_root: Object;

	render() {
		return <ProgressBarAndroid ref={c => (this._root = c)} style={this.props.style} />;
	}
}
