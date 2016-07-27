/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import CardSummary from '../Card/CardSummary';
import Embed from '../Embed/Embed';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	image: {
		marginTop: 8,
		height: 180,
		width: null,
	},
	item: {
		marginTop: 4,
		marginBottom: 8,
		marginHorizontal: 16,
	},
});

type Props = {
	text: string;
	meta: ?{
		photo?: Object
	};
}

export default class DiscussionSummary extends Component {
	static propTypes = {
		text: PropTypes.string.isRequired,
		meta: PropTypes.object,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		const {
			text,
			meta,
		} = this.props;

		const trimmedText = text.trim();

		let cover, hideSummary;

		if (meta && meta.photo) {
			cover = (
				<Embed
					url={meta.photo.url}
					data={meta.photo}
					thumbnailStyle={styles.image}
					showTitle={false}
					showSummary={false}
					openOnPress={false}
				/>
			);

			hideSummary = true;
		} else if (meta.oembed) {
			cover = (
				<Embed
					data={meta.oembed}
					thumbnailStyle={styles.image}
					showTitle={false}
					showSummary={false}
				/>
			);
		}

		return (
			<View {...this.props}>
				{cover}

				{hideSummary ? null :
					<CardSummary style={styles.item} text={trimmedText} />
				}
			</View>
		);
	}
}
