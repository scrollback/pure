/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import FloatingActionButton from '../Core/FloatingActionButton';
import Modal from '../Core/Modal';
import StartDiscussionContainer from '../../containers/StartDiscussionContainer';

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
	user: string;
	onNavigation: Function;
}

type State = {
	modalVisible: boolean
}

export default class StartDiscussionButton extends Component<void, Props, State> {
	static propTypes = {
		room: PropTypes.string.isRequired,
		user: PropTypes.string.isRequired,
		onNavigation: PropTypes.func.isRequired,
	};

	state: State = {
		modalVisible: false,
	};

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleRequestClose: Function = () => {
		this.setState({
			modalVisible: false,
		});
	};

	_handlePress: Function = () => {
		this.setState({
			modalVisible: true,
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

				<Modal
					visible={this.state.modalVisible}
					onRequestClose={this._handleRequestClose}
					animationType='fade'
				>
					<StartDiscussionContainer {...this.props} dismiss={this._handleRequestClose} />
				</Modal>
			</View>
		);
	}
}
