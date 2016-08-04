/* @flow */

import React, { Component } from 'react';
import ReactNative from 'react-native';
import NavigationRootContainer from '../containers/NavigationRootContainer';
import NavigationScene from './Navigation/NavigationScene';
import NavigationView from './Navigation/NavigationView';
import UserSwitcherContainer from '../containers/UserSwitcherContainer';
import ModalHost from './Core/ModalHost';
import routeMapper from '../../routeMapper';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		flex: 1,
	},
	inner: {
		flex: 1,
	},
});

export default class Home extends Component<void, any, void> {

	_handleBackPress = () => {
		if (ModalHost.isOpen()) {
			ModalHost.requestClose();
			return true;
		}

		return false;
	};

	_renderScene = (props: any) => {
		return (
			<NavigationScene
				{...props}
				key={props.scene.key}
				routeMapper={routeMapper}
			/>
		);
	};

	_renderNavigator = (props: any) => {
		return (
			<NavigationView
				{...props}
				renderScene={this._renderScene}
				onBackPress={this._handleBackPress}
			/>
		);
	};

	render() {
		return (
			<View style={styles.container}>
				<UserSwitcherContainer />
				<View style={styles.inner}>
					<NavigationRootContainer
						renderNavigator={this._renderNavigator}
					/>
				</View>
				<ModalHost />
			</View>
		);
	}
}
