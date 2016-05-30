/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import Icon from './Icon';
import Colors from '../../../Colors';

const {
	StyleSheet,
	TouchableHighlight,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		height: 36,
		width: 36,
		borderRadius: 18,
		elevation: 4,
	},
	button: {
		backgroundColor: Colors.darkGrey,
		height: 36,
		width: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
	},
	icon: {
		color: Colors.white,
	},
});

type Props = {
	style?: any;
}

export default class CloseButton extends Component<void, Props, void> {
	static propTypes = {
		style: TouchableHighlight.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		return (
			<TouchableHighlight
				{...this.props}
				underlayColor={Colors.underlay}
				style={[ styles.container, this.props.style ]}
			>
				<View style={styles.button}>
					<Icon
						name='close'
						style={styles.icon}
						size={16}
					/>
				</View>
			</TouchableHighlight>
		);
	}
}
