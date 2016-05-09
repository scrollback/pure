/* @flow */

import React from 'react';
import ReactNative from 'react-native';
import Modal from '../components/views/Modal';
import renderOverlay from './renderOverlay';
import renderScene from './renderScene';
import NavigationAnimatedView from '../navigation-rfc/Navigation/NavigationAnimatedView';
import NavigationReducer from '../navigation-rfc/Navigation/NavigationReducer';

const {
	StyleSheet,
	BackAndroid,
} = ReactNative;

const styles = StyleSheet.create({
	animatedView: {
		flex: 1,
	},
});

let _navState, _onNavigation;

BackAndroid.addEventListener('hardwareBackPress', () => {
	if (Modal.isShown()) {
		Modal.renderChild(null);

		return true;
	}

	if (_onNavigation && _navState && _navState.index !== 0) {
		_onNavigation(new NavigationReducer.Actions.Pop());

		return true;
	}

	return false;
});

const renderNavigator = (): Function => {
	return (navState, onNavigation) => {
		if (!navState) {
			return null;
		}

		_navState = navState;
		_onNavigation = onNavigation;

		return (
			<NavigationAnimatedView
				navigationState={navState}
				style={styles.animatedView}
				renderOverlay={renderOverlay(navState, onNavigation)}
				renderScene={renderScene(navState, onNavigation)}
			/>
		);
	};
};

export default renderNavigator;
