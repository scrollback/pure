/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import Colors from '../../../Colors';
import AppText from '../Core/AppText';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	title: {
		fontWeight: 'bold',
		color: Colors.darkGrey,
	},
});

type Props = {
	children?: React.Element;
	style?: any;
}

export default class CardTitle extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.string.isRequired,
		style: AppText.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<AppText
				{...this.props}
				style={[ styles.title, this.props.style ]}
				numberOfLines={2}
			>
				{this.props.children}
			</AppText>
		);
	}
}
