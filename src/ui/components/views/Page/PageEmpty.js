/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import Page from './Page';

const {
	StyleSheet,
	View,
	Image,
} = ReactNative;

const styles = StyleSheet.create({
	content: {
		alignItems: 'center',
		margin: 32,
	},
	missing: {
		margin: 16,
		textAlign: 'center',
		fontSize: 16,
		lineHeight: 24,
	},
});

type Props = {
	label: string;
	image: string;
}

export default class PageEmpty extends Component<void, Props, void> {
	static propTypes = {
		label: PropTypes.string,
		image: PropTypes.any,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		const {
			label,
			image,
		} = this.props;

		let source;

		switch (image) {
		case 'cool':
			source = require('../../../../../assets/monkey-cool.png');
			break;
		case 'happy':
			source = require('../../../../../assets/monkey-happy.png');
			break;
		case 'meh':
			source = require('../../../../../assets/monkey-meh.png');
			break;
		case 'sad':
			source = require('../../../../../assets/monkey-sad.png');
			break;
		default:
			source = null;
		}

		return (
			<Page {...this.props}>
				<View style={styles.content}>
					{image ?
						<Image source={source} /> :
						null
					}
					{label ?
						<AppText style={styles.missing}>{label}</AppText> :
						null
					}
				</View>
			</Page>
		);
	}
}
