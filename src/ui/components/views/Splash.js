/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import Loading from './Loading';

const {
	StyleSheet,
	View,
	Image,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: Colors.primary,
	},
	logo: {
		flex: 1,
		resizeMode: 'contain',
		marginTop: 240,
	},
	loading: {
		height: 24,
		width: 24,
		marginVertical: 96,
		marginHorizontal: 16,
	},
});

export default class Splash extends Component<void, any, void> {
	shouldComponentUpdate(nextProps: any): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		return (
			<View style={styles.container}>
				<Image style={styles.logo} source={require('../../../../assets/logo-white.png')} />
				<Loading style={styles.loading} />
			</View>
		);
	}
}
