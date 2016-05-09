/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import Icon from './Icon';

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

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
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
