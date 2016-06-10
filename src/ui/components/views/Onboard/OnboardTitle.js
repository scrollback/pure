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
	title: {
		color: Colors.darkGrey,
		fontSize: 28,
		margin: 16,
		textAlign: 'center',
	},
});

type Props = {
	children?: React.Element;
	style?: any;
}

export default class OnboardTitle extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.node.isRequired,
		style: AppText.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return <AppText style={[ styles.title, this.props.style ]}>{this.props.children}</AppText>;
	}
}
