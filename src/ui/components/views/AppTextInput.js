/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';

const {
	StyleSheet,
	TextInput,
} = ReactNative;

const styles = StyleSheet.create({
	text: {
		fontFamily: 'Lato',
		fontSize: 14,
		lineHeight: 21,
	},
});

type Props = {
	style?: any;
}

export default class AppTextInput extends Component<void, Props, void> {
	static propTypes = {
		style: TextInput.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
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
