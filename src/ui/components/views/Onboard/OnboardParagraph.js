/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import Colors from '../../../Colors';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	paragraph: {
		color: Colors.darkGrey,
		fontSize: 16,
		textAlign: 'center',
		margin: 16,
	},
});

type Props = {
	children?: React.Element<*>;
	style?: any;
}

export default class OnboardParagraph extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.node.isRequired,
		style: AppText.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return <AppText style={[ styles.paragraph, this.props.style ]}>{this.props.children}</AppText>;
	}
}
