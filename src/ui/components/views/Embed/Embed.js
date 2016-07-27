/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import EmbedThumbnail from './EmbedThumbnail';
import EmbedTitle from './EmbedTitle';
import EmbedSummary from './EmbedSummary';
import type { Embed as EmbedData } from '../../../../modules/url-preview/oEmbedTypes';

const {
	Linking,
	TouchableOpacity,
	View,
} = ReactNative;

type DefaultProps = {
	openOnPress: boolean;
}

type Props = {
	url?: string;
	data: EmbedData;
	showThumbnail?: boolean;
	showTitle?: boolean;
	showSummary?: boolean;
	openOnPress?: boolean;
	containerStyle?: any;
	thumbnailStyle?: any;
	titleStyle?: any;
	summaryStyle?: any;
}

export default class Embed extends Component<DefaultProps, Props, void> {
	static propTypes = {
		data: PropTypes.object,
		url: PropTypes.string.isRequired,
		showThumbnail: PropTypes.bool,
		showTitle: PropTypes.bool,
		showSummary: PropTypes.bool,
		openOnPress: PropTypes.bool,
		containerStyle: View.propTypes.style,
		thumbnailStyle: EmbedThumbnail.propTypes.style,
		titleStyle: EmbedTitle.propTypes.style,
		summaryStyle: EmbedSummary.propTypes.style,
	};

	static defaultProps = {
		openOnPress: true,
	};

	shouldComponentUpdate(nextProps: Props, nextState: void): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handlePress = () => {
		if (typeof this.props.url === 'string') {
			Linking.openURL(this.props.url);
		}
	};

	render() {
		const { data } = this.props;

		if (typeof data === 'object' && data !== null) {
			const {
				showThumbnail,
				showTitle,
				showSummary,
				openOnPress,
				thumbnailStyle,
				titleStyle,
				summaryStyle,
			} = this.props;

			const items = [];

			if (showThumbnail !== false && data.thumbnail_url) {
				items.push(
					<EmbedThumbnail
						key='thumbnail'
						embed={data}
						style={thumbnailStyle}
					/>,
				);
			}

			if (showTitle !== false && data.title) {
				items.push(
					<EmbedTitle
						key='title'
						title={data.title}
						style={titleStyle}
					/>,
				);
			}

			if (showSummary !== false && data.description) {
				items.push(
					<EmbedSummary
						key='summary'
						summary={data.description}
						style={summaryStyle}
					/>,
				);
			}

			if (items.length === 0) {
				return null;
			}

			if (openOnPress === false) {
				return (
					<View {...this.props}>
						{items}
					</View>
				);
			} else {
				return (
					<TouchableOpacity {...this.props} onPress={this._handlePress}>
						<View>{items}</View>
					</TouchableOpacity>
				);
			}
		} else {
			return null;
		}
	}
}
