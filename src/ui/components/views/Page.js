/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	page: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

type Props = {
	children?: Element;
	style?: any;
}

export default class Page extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.node.isRequired,
		style: View.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		return (
			<View style={[ styles.page, this.props.style ]}>
				{this.props.children}
			</View>
		);
	}
}
