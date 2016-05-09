/* @flow */

import React, { Component, PropTypes } from 'react';
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
		position: 'absolute',
		right: 16,
		bottom: 16,
		height: 56,
		width: 56,
		borderRadius: 28,
		elevation: 6,
	},
	fab: {
		backgroundColor: Colors.accent,
		height: 56,
		width: 56,
		borderRadius: 28,
	},
	icon: {
		margin: 16,
		color: Colors.white,
	},
});

type Props = {
	icon: string;
}

export default class FloatingActionButton extends Component<void, Props, void> {
	static propTypes = {
		icon: PropTypes.string.isRequired,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		return (
			<TouchableHighlight {...this.props} style={styles.container}>
				<View style={styles.fab}>
					<Icon
						name={this.props.icon}
						style={styles.icon}
						size={24}
					/>
				</View>
			</TouchableHighlight>
		);
	}
}
