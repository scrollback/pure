/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';

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
	children?: React.Element;
	style?: any;
}

export default class AppText extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.node.isRequired,
		style: Text.propTypes.style,
	};

	_root: Object;

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
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
