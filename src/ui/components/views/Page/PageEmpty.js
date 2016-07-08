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
	},
});

type Props = {
	label: string;
	image: any;
}

export default class PageEmpty extends Component<void, Props, void> {
	static propTypes = {
		label: PropTypes.string,
		image: Image.propTypes.source,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		const {
			label,
			image,
		} = this.props;

		return (
			<Page {...this.props}>
				<View style={styles.content}>
					{image ?
						<Image source={image} /> :
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
