/* @flow */

import React, { PropTypes } from 'react';
import ReactNative from 'react-native';
import AppText from '../AppText';
import Colors from '../../../Colors';

const {
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	title: {
		color: Colors.darkGrey,
		fontSize: 28,
		lineHeight: 42,
		margin: 16,
		textAlign: 'center',
	},
});

type Props = {
	children: Element;
	style?: any;
}

const OnboardTitle = (props: Props) => <AppText style={[ styles.title, props.style ]}>{props.children}</AppText>;

OnboardTitle.propTypes = {
	children: PropTypes.node.isRequired,
	style: AppText.propTypes.style,
};

export default OnboardTitle;
