/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import Colors from '../../../Colors';
import RichText from '../Core/RichText';

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

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
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
