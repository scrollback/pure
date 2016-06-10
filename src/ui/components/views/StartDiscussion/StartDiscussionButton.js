/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import FloatingActionButton from '../Core/FloatingActionButton';

const {
	View,
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		flex: 1,
	},
});

type Props = {
	room: string;
	onNavigate: Function;
}

export default class StartDiscussionButton extends Component<void, Props, void> {
	static propTypes = {
		room: PropTypes.string.isRequired,
		onNavigate: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handlePress = () => {
		this.props.onNavigate({
			type: 'push',
			payload: {
				name: 'compose',
				props: {
					room: this.props.room,
				},
			},
		});
	};

	render() {
		return (
			<View style={styles.container}>
				<FloatingActionButton
					{...this.props}
					icon='create'
					onPress={this._handlePress}
				/>
			</View>
		);
	}
}
