/* @flow */

import React, { PropTypes } from 'react';
import ReactNative from 'react-native';
import AppText from '../AppText';
import NextButtonLabel from './NextButtonLabel';
import Colors from '../../../Colors';

const {
	View,
	TouchableHighlight,
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	button: {
		height: 56,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: Colors.info,
	},

	label: {
		color: Colors.fadedBlack,
		fontWeight: 'bold',
		margin: 16,
	},

	disabled: {
		opacity: 0.5,
	},
});

type Props = {
	label?: ?string;
	loading?: boolean;
	disabled?: boolean;
	onPress: Function;
}

const NextButton = (props: Props) => {
	if (props.loading) {
		return (
			<View style={styles.button}>
				<AppText style={styles.label}>
					JUST A SEC…
				</AppText>
			</View>
		);
	}

	if (props.disabled) {
		return <NextButtonLabel label={props.label || ''} style={[ styles.button, styles.disabled ]} />;
	}

	return (
		<TouchableHighlight onPress={props.onPress}>
			<NextButtonLabel label={props.label || ''} style={styles.button} />
		</TouchableHighlight>
	);
};

NextButton.propTypes = {
	label: PropTypes.string,
	loading: PropTypes.bool,
	disabled: PropTypes.bool,
	onPress: PropTypes.func.isRequired,
};

export default NextButton;
