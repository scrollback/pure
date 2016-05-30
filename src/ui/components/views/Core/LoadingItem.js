/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
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

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<View style={[ styles.container, this.props.style ]}>
				<LoadingFancy />
			</View>
		);
	}
}
