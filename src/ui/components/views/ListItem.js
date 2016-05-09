/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import TouchFeedback from './TouchFeedback';
import Colors from '../../Colors';

const {
	StyleSheet,
	PixelRatio,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.white,
		borderColor: Colors.separator,
		borderBottomWidth: 1 / PixelRatio.get(),
		height: 64,
	},
});

type Props = {
	children?: any;
	containerStyle?: any;
}

export default class ListItem extends Component<void, Props, void> {
	static propTypes = {
		children: PropTypes.node.isRequired,
		containerStyle: View.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		return (
			<TouchFeedback {...this.props}>
				<View style={[ styles.container, this.props.containerStyle ]}>
					{this.props.children}
				</View>
			</TouchFeedback>
		);
	}
}
