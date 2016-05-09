/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import AppText from '../AppText';
import TouchFeedback from '../TouchFeedback';
import Loading from '../Loading';
import Colors from '../../../Colors';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		marginVertical: 16,
	},
	loader: {
		height: 21,
		width: 21,
		marginHorizontal: 16,
	},
	button: {
		backgroundColor: Colors.info,
		padding: 12,
		borderRadius: 3,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonText: {
		color: Colors.white,
		textAlign: 'center',
		paddingHorizontal: 4,
	},
});

type Props = {
	label: string;
	onPress: Function;
	spinner?: boolean;
	disabled?: boolean;
	style?: any;
}

export default class LargeButton extends Component<void, Props, void> {
	static propTypes = {
		label: PropTypes.string.isRequired,
		onPress: PropTypes.func.isRequired,
		spinner: PropTypes.bool,
		disabled: PropTypes.bool,
		style: View.propTypes.style,
	};

	render() {
		return (
			<View style={styles.container}>
				<TouchFeedback onPress={this.props.disabled ? null : this.props.onPress}>
					<View style={[ styles.button, this.props.style ]}>
						{this.props.spinner ? <Loading style={styles.loader} /> : null}

						<AppText style={styles.buttonText}>{this.props.label.toUpperCase()}</AppText>
					</View>
				</TouchFeedback>
			</View>
		);
	}
}
