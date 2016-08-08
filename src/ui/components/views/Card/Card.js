/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import Colors from '../../../Colors';

const {
	StyleSheet,
	View,
	PixelRatio,
} = ReactNative;

const styles = StyleSheet.create({
	card: {
		backgroundColor: Colors.white,
		borderColor: Colors.separator,
		borderTopWidth: 1 / PixelRatio.get(),
		borderBottomWidth: 1 / PixelRatio.get(),
		marginVertical: 6,
	},
});

type Props = {
	children?: React.Element<*>;
	style?: any;
}

export default class Card extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.node.isRequired,
		style: View.propTypes.style,
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
			<View
				{...this.props}
				style={[ styles.card, this.props.style ]}
				ref={c => (this._root = c)}
			>
				{this.props.children}
			</View>
		);
	}
}
