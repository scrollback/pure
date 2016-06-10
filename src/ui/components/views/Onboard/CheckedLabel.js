/* @flow */

import React, { Component, PropTypes } from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from '../Core/Icon';
import AppText from '../Core/AppText';
import Colors from '../../../Colors';

const styles = StyleSheet.create({
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 4,
	},

	icon: {
		height: 20,
		width: 20,
		color: Colors.accent,
	},

	label: {
		color: Colors.darkGrey,
		marginHorizontal: 8,
	}
});

type Props = {
	label: string;
	style?: any;
}

export default class CheckedLabel extends Component<void, Props, void> {
	static propTypes = {
		label: PropTypes.string.isRequired,
		style: View.propTypes.style,
	};

	render() {
		return (
			<View style={[ styles.item, this.props.style ]}>
				<Icon
					size={20}
					name='done'
					style={styles.icon}
				/>
				<AppText style={styles.label}>{this.props.label}</AppText>
			</View>
		);
	}
}
