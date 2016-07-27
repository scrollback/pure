/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import RichText from '../Core/RichText';
import Embed from '../Embed/Embed';
import Colors from '../../../Colors';

const {
	View,
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		margin: 12,
	},
	text: {
		color: Colors.darkGrey,
		fontSize: 14,
		lineHeight: 21,
	},
	embed: {
		borderColor: 'rgba(0, 0, 0, .24)',
		borderWidth: StyleSheet.hairlineWidth,
		padding: 8,
		borderRadius: 2,
	},
	embedThumbnail: {
		marginBottom: 8,
	},
	embedWithText: {
		marginBottom: 8,
	},
});

type Props = {
	meta: any;
	body: string;
}

export default class ChatAvatar extends Component<void, Props, void> {

	static propTypes = {
		meta: PropTypes.object,
		body: PropTypes.string,
	};

	shouldComponentUpdate(nextProps: any, nextState: void): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		const { meta, body } = this.props;

		if (meta) {
			if (meta.photo) {
				const { photo } = meta;

				return (
					<Embed
						data={photo}
						showTitle={false}
						thumbnailStyle={styles.container}
						openOnPress={false}
					/>
				);
			} else if (meta.oembed) {
				return (
					<View style={styles.container}>
						<Embed
							data={meta.oembed}
							style={[ styles.embed, styles.embedWithText ]}
							thumbnailStyle={styles.embedThumbnail}
						/>
						<RichText
							selectable
							text={body}
							style={styles.text}
						/>
					</View>
				);
			}
		}

		return (
			<RichText
				selectable
				text={body}
				style={[ styles.text, styles.container ]}
			/>
		);
	}
}
