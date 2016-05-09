/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import RichText from './RichText';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	summary: {
		color: Colors.grey,
	},
});

type Props = {
	text: string;
	style?: any;
}

export default class TextSummary extends Component<void, Props, void> {
	static propTypes = {
		text: PropTypes.string.isRequired,
		style: RichText.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		return (
			<RichText
				{...this.props}
				style={[ styles.summary, this.props.style ]}
				numberOfLines={3}
				text={this.props.text}
			/>
		);
	}
}
