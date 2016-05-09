/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';

const {
	StyleSheet,
	Text,
} = ReactNative;

const styles = StyleSheet.create({
	text: {
		fontFamily: 'Lato',
		fontSize: 14,
		lineHeight: 21,
	},
});

type Props = {
	children?: Element;
	style?: any;
}

export default class AppText extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.node.isRequired,
		style: Text.propTypes.style,
	};

	_root: Object;

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	setNativeProps: Function = (nativeProps: Props) => {
		this._root.setNativeProps(nativeProps);
	};

	render() {
		return (
			<Text
				{...this.props}
				style={[ styles.text, this.props.style ]}
				ref={c => (this._root = c)}
			>
				{this.props.children}
			</Text>
		);
	}
}
