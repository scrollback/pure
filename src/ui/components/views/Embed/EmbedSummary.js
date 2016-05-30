/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	summary: {
		fontSize: 12,
		lineHeight: 18,
	},
});

type Props = {
	summary: string;
	style?: any;
}

export default class EmbedSummary extends Component<void, Props, void> {
	static propTypes = {
		summary: PropTypes.string.isRequired,
		style: AppText.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		if (this.props.summary) {
			return (
				<AppText
					numberOfLines={2}
					{...this.props}
					style={[ styles.summary, this.props.style ]}
				>
					{this.props.summary}
				</AppText>
			);
		} else {
			return null;
		}
	}
}
