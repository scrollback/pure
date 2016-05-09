/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import AppText from './AppText';

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
	children?: Element;
	style?: any;
}

export default class CardTitle extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.string.isRequired,
		style: AppText.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
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
