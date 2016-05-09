/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';

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
	children?: any;
	style?: any;
}

export default class AppbarSecondary extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.node.isRequired,
		style: View.propTypes.style,
	};

	_root: Object;

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
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
