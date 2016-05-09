/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import ListItem from '../ListItem';
import AppText from '../AppText';
import Colors from '../../../Colors';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 24,
		paddingVertical: 12,
	},

	title: {
		fontWeight: 'bold',
		color: Colors.black,
	},

	summary: {
		color: Colors.black,
		opacity: 0.5,
		fontSize: 12,
		lineHeight: 18,
	},
});

type Props = {
	place: {
		primaryText: string;
		secondaryText?: string;
		fullText?: string;
	}
}

export default class LocationItem extends Component<void, Props, void> {
	static propTypes = {
		place: PropTypes.shape({
			primaryText: PropTypes.string.isRequired,
			secondaryText: PropTypes.string,
			fullText: PropTypes.string,
		}),
	};

	render() {
		const { place } = this.props;

		return (
			<ListItem {...this.props}>
				<View style={styles.container}>
					<AppText style={styles.title}>{place.primaryText}</AppText>
					<AppText style={styles.summary}>{place.secondaryText || place.fullText}</AppText>
				</View>
			</ListItem>
		);
	}
}
