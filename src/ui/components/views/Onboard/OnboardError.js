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
	hint: {
		height: 36,
		color: Colors.grey,
		textAlign: 'center',
		fontSize: 12,
		marginVertical: 16,
	},

	error: {
		color: Colors.error,
	},
});

type Props = {
	message: ?string;
	hint: ?string;
};

export default class OnboardError extends Component<void, Props, void> {
	static propTypes = {
		message: PropTypes.string,
		hint: PropTypes.string,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		const message = this.props.message || this.props.hint || '';

		return (
			<AppText style={[ styles.hint, this.props.message ? styles.error : null ]}>
				{message}
			</AppText>
		);
	}
}
