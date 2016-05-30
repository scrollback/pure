/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import shallowCompare from 'react-addons-shallow-compare';

const {
	Text,
} = ReactNative;

type Props = {
	style?: any;
}

export default class Icon extends Component<void, Props, void> {
	static propTypes = {
		style: Text.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	setNativeProps(nativeProps: Props) {
		this._root.setNativeProps(nativeProps);
	}

	_root: Object;

	render() {
		return (
			<MaterialIcons
				ref={c => (this._root = c)}
				allowFontScaling={false}
				{...this.props}
			/>
		);
	}
}
