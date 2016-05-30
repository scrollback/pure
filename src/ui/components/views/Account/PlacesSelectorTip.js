/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import Colors from '../../../Colors';

const {
	StyleSheet,
	Image,
	View,
	ScrollView,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},

	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 16,
	},

	header: {
		flexDirection: 'row',
	},

	image: {
		margin: 8,
	},

	title: {
		color: Colors.darkGrey,
		fontWeight: 'bold',
		fontSize: 16,
		lineHeight: 24,
		margin: 8,
		textAlign: 'center',
	},

	summary: {
		margin: 16,
		color: Colors.darkGrey,
		textAlign: 'center',
	},
});

type Props = {
	type: 'home' | 'work' | 'hometown';
	style?: any;
}

const TYPES = {
	home: {
		title: 'Where do you live?',
		summary: 'Type and pick your apartment, street or neighborhood.',
		icon: 'location-city',
		image: require('../../../../../assets/house-and-tree.png'), // eslint-disable-line import/no-commonjs
	},
	work: {
		title: 'Where do you work or study?',
		summary: 'Type and pick your office or college.',
		icon: 'work',
		image: require('../../../../../assets/office-building.png'), // eslint-disable-line import/no-commonjs
	},
	hometown: {
		title: 'Where are you from?',
		summary: 'Type and pick your hometown.',
		icon: 'home',
		image: require('../../../../../assets/village-house.png'), // eslint-disable-line import/no-commonjs
	},
};

export default class PlacesSelectorTip extends Component<void, Props, void> {
	static propTypes = {
		type: PropTypes.oneOf([ 'home', 'work', 'hometown' ]).isRequired,
		style: View.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		const data = TYPES[this.props.type];

		return (
			<ScrollView {...this.props} contentContainerStyle={styles.container}>
				<View style={styles.content}>
					<View style={styles.header}>
						<AppText style={styles.title}>{data.title}</AppText>
					</View>
					<Image style={styles.image} source={data.image} />
					<AppText style={styles.summary}>{data.summary}</AppText>
				</View>
			</ScrollView>
		);
	}
}
