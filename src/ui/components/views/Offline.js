/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import AppText from './AppText';
import Page from './Page';

const {
	StyleSheet,
	Image,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		padding: 16,
		backgroundColor: Colors.primary,
	},
	image: {
		marginHorizontal: 16,
		marginVertical: 48,
	},
	header: {
		color: Colors.white,
		fontSize: 20,
		lineHeight: 30,
	},
	footer: {
		color: Colors.white,
	},
});

type Props = {
	style?: any;
}

export default class Offline extends Component<void, Props, void> {
	static propTypes = {
		style: Page.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		return (
			<Page {...this.props} style={[ styles.container, this.props.style ]}>
				<AppText style={styles.header}>Network unavailable!</AppText>
				<Image style={styles.image} source={require('../../../../assets/astronaut.png')} />
				<AppText style={styles.footer}>Waiting for connection…</AppText>
			</Page>
		);
	}
}
