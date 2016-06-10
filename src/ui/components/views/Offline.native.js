/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import Colors from '../../Colors';
import AppText from './Core/AppText';
import Page from './Page/Page';

const {
	StyleSheet,
	Image,
	StatusBar,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		padding: 16,
		backgroundColor: Colors.white,
	},
	image: {
		marginHorizontal: 16,
		marginVertical: 48,
	},
	header: {
		color: Colors.darkGrey,
		fontSize: 20,
	},
	footer: {
		color: Colors.darkGrey,
	},
});

type Props = {
	style?: any;
}

export default class Offline extends Component<void, Props, void> {
	static propTypes = {
		style: Page.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<Page {...this.props} style={[ styles.container, this.props.style ]}>
				<StatusBar backgroundColor={Colors.grey} />
				<AppText style={styles.header}>Network unavailable!</AppText>
				<Image style={styles.image} source={require('../../../../assets/offline-balloon.png')} />
				<AppText style={styles.footer}>Waiting for connection…</AppText>
			</Page>
		);
	}
}
