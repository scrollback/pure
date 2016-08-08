/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import Colors from '../../../Colors';

const {
	PixelRatio,
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	appbar: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: Colors.white,
		borderColor: 'rgba(0, 0, 0, .24)',
		borderBottomWidth: 1 / PixelRatio.get(),
		paddingHorizontal: 4,
		height: 56,
	},
});

type Props = {
	children?: React.Element<*>;
	style?: any;
}

export default class AppbarSecondary extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.node.isRequired,
		style: View.propTypes.style,
	};

	_root: Object;

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	setNativeProps(nativeProps: any) {
		this._root.setNativeProps(nativeProps);
	}

	render() {
		return (
			<View
				{...this.props}
				style={[ styles.appbar, this.props.style ]}
				ref={c => (this._root = c)}
			>
				{this.props.children}
			</View>
		);
	}
}
