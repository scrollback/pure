/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';

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
		marginVertical: 4,
	},
});

type Props = {
	children?: Element;
	style?: any;
}

export default class Card extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.node.isRequired,
		style: View.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
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
