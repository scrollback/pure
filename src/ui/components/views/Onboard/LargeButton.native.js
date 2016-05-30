/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import TouchFeedback from '../Core/TouchFeedback';
import Loading from '../Core/Loading';
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

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

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
