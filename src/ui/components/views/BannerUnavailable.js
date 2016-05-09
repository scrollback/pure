/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import AppText from './AppText';
import Colors from '../../Colors';
import { config } from '../../../core-client';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	banner: {
		backgroundColor: Colors.info,
		padding: 16,
	},

	bannerText: {
		color: Colors.white,
	},
});

export default class extends Component<void, any, void> {
	shouldComponentUpdate(nextProps: any): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		return (
			<View style={styles.banner}>
				<AppText style={styles.bannerText}>
					{config.app_name} is yet to launch in your neighborhood. Meanwhile join the open house and connect with Neighbors from all around.
				</AppText>
			</View>
		);
	}
}
