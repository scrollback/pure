/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import RichText from '../Core/RichText';
import Embed from '../Embed/Embed';
import { parseURLs } from '../../../../lib/URL';
import Colors from '../../../Colors';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	text: {
		color: Colors.darkGrey,
		fontSize: 14,
		lineHeight: 21,
		marginVertical: 8,
		marginHorizontal: 12,
	},
	thumbnail: {
		marginVertical: 4,
	},
	embed: {
		borderColor: 'rgba(0, 0, 0, .24)',
		borderWidth: StyleSheet.hairlineWidth,
		padding: 8,
		marginVertical: 4,
		borderRadius: 2,
	},
	embedThumbnail: {
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
		const links = body ? parseURLs(body, 1) : null;

		if (meta && meta.photo) {
			const { photo } = meta;

			return (
				<Embed
					url={photo.url}
					data={photo}
					showTitle={false}
					thumbnailStyle={styles.thumbnail}
					openOnPress={false}
				/>
			);
		} else if (links && links.length) {
			return (
				<Embed
					url={links[0]}
					style={styles.embed}
					thumbnailStyle={styles.embedThumbnail}
				/>
			);
		}

		return (
			<RichText
				selectable
				text={body}
				style={styles.text}
			/>
		);
	}
}
