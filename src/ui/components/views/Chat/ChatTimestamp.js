/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import Icon from '../Core/Icon';
import Time from '../Core/Time';

const {
	StyleSheet,
	View,
} = ReactNative;

const FADED_GREY = '#b2b2b2';

const styles = StyleSheet.create({
	timestamp: {
		flexDirection: 'row',
		marginTop: 4,
	},
	timestampIcon: {
		color: FADED_GREY,
		marginVertical: 2,
	},
	timestampText: {
		color: FADED_GREY,
		fontSize: 12,
		marginHorizontal: 6,
		paddingHorizontal: 8,
	},
});

type Props = {
	time: number;
	style?: any;
};

export default class ChatTimestamp extends Component<void, Props, void> {
	static propTypes = {
		time: PropTypes.number.isRequired,
		style: View.propTypes.style,
	};

	render() {
		return (
			<View style={[ styles.timestamp, this.props.style ]}>
				<Icon
					name='access-time'
					style={styles.timestampIcon}
					size={12}
				/>
				<Time
					type='long'
					time={this.props.time}
					style={styles.timestampText}
				/>
			</View>
		);
	}
}
