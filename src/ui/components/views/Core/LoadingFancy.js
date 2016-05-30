/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import Loading from './Loading';
import Colors from '../../../Colors';

const {
	StyleSheet,
	PixelRatio,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		backgroundColor: Colors.white,
		borderColor: Colors.separator,
		borderWidth: 1 / PixelRatio.get(),
		height: 36,
		width: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		margin: 24,
		elevation: 1,
	},

	loading: {
		height: 24,
		width: 24,
	},
});

type Props = {
	style?: any
}

export default class LoadingFancy extends Component<void, Props, void> {
	static propTypes = {
		style: View.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<View style={[ styles.container, this.props.style ]}>
				<Loading style={styles.loading} />
			</View>
		);
	}
}
