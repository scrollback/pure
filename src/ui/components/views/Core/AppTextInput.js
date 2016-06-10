/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';

const {
	StyleSheet,
	TextInput,
} = ReactNative;

const styles = StyleSheet.create({
	text: {
		fontFamily: 'Lato',
		fontSize: 14,
	},
});

type Props = {
	style?: any;
}

export default class AppTextInput extends Component<void, Props, void> {
	static propTypes = {
		style: TextInput.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_root: Object;

	setNativeProps: Function = (nativeProps) => {
		this._root.setNativeProps(nativeProps);
	};

	focus: Function = (...args) => {
		this._root.focus(...args);
	};

	blur: Function = (...args) => {
		this._root.blur(...args);
	};

	render() {
		return (
			<TextInput
				{...this.props}
				style={[ styles.text, this.props.style ]}
				ref={c => (this._root = c)}
			/>
		);
	}
}
