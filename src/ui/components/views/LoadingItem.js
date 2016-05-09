/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import LoadingFancy from './LoadingFancy';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		alignSelf: 'stretch',
		alignItems: 'center',
	},
});

type Props = {
	style?: any;
}

export default class LoadingItem extends Component<void, Props, void> {
	static propTypes = {
		style: View.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		return (
			<View style={[ styles.container, this.props.style ]}>
				<LoadingFancy />
			</View>
		);
	}
}
