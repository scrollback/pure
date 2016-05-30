/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import Colors from '../../../Colors';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 8,
	},

	text: {
		fontSize: 12,
		color: Colors.grey,
	},

	g1: {
		color: '#4189F8',
	},

	o1: {
		color: '#EA4532',
	},

	o2: {
		color: '#FBB800',
	},

	g2: {
		color: '#4189F8',
	},

	l1: {
		color: '#33A54B',
	},

	e1: {
		color: '#EA4532',
	},
});

type Props = {
	style?: any;
}

export default class PoweredByGoogle extends Component<void, Props, void> {
	static propTypes = {
		style: View.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<View style={[ styles.container, this.props.style ]}>
				<AppText style={styles.text}>
					Powered by <AppText style={styles.g1}>G</AppText><AppText style={styles.o1}>o</AppText><AppText style={styles.o2}>o</AppText><AppText style={styles.g2}>g</AppText><AppText style={styles.l1}>l</AppText><AppText style={styles.e1}>e</AppText>
				</AppText>
			</View>
		);
	}
}
