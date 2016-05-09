/* @flow */
/* eslint-disable react/no-multi-comp, react/jsx-no-bind */

import React from 'react';
import ReactNative from 'react-native';
import AppText from '../components/views/AppText';
import AppbarTouchable from '../components/views/AppbarTouchable';
import AppbarIcon from '../components/views/AppbarIcon';
import Colors from '../Colors';
import routeMapper from './routeMapper';
import NavigationReducer from '../navigation-rfc/Navigation/NavigationReducer';
import NavigationHeader from '../navigation-rfc/CustomComponents/NavigationHeader';

const {
	View,
	StyleSheet,
	Platform,
} = ReactNative;

const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const styles = StyleSheet.create({
	header: {
		backgroundColor: Colors.primary,
	},

	title: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		height: APPBAR_HEIGHT,
		marginHorizontal: 16,
	},

	titleText: {
		flex: 1,
		lineHeight: 27,
		fontSize: 18,
		fontWeight: 'bold',
		color: Colors.white,
		textAlign: Platform.OS === 'ios' ? 'center' : 'left',
	},

	button: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

const _renderTitleComponent = (route, index, onNavigation) => {
	const routeDesc = routeMapper(route);
	const TitleComponent = routeDesc.titleComponent;

	if (TitleComponent) {
		return (
			<View style={styles.title}>
				<TitleComponent {...route.props} onNavigation={onNavigation} />
			</View>
		);
	}

	if (routeDesc.title) {
		return (
			<View style={styles.title}>
				<AppText numberOfLines={1} style={styles.titleText}>{routeDesc.title}</AppText>
			</View>
		);
	}

	return null;
};

const _renderLeftComponent = (route, index, onNavigation) => {
	const routeDesc = routeMapper(route);
	const LeftComponent = routeDesc.leftComponent;

	if (LeftComponent) {
		return <LeftComponent {...route.props} onNavigation={onNavigation} />;
	}

	if (index !== 0) {
		return (
			<AppbarTouchable style={styles.button} onPress={() => onNavigation(new NavigationReducer.Actions.Pop())}>
				<AppbarIcon name='arrow-back' />
			</AppbarTouchable>
		);
	}

	return null;
};

const _renderRightComponent = (route, index, onNavigation) => {
	const routeDesc = routeMapper(route);
	const RightComponent = routeDesc.rightComponent;

	if (RightComponent) {
		return <RightComponent {...route.props} onNavigation={onNavigation} />;
	}

	return null;
};

const renderOverlay = function(navState: Object, onNavigation: Function): Function {
	return props => {
		if (navState.get(navState.index).fullscreen) {
			return null;
		}

		return (
			<NavigationHeader
				{...props}
				style={styles.header}
				renderTitleComponent={(route, index) => _renderTitleComponent(route, index, onNavigation)}
				renderLeftComponent={(route, index) => _renderLeftComponent(route, index, onNavigation)}
				renderRightComponent={(route, index) => _renderRightComponent(route, index, onNavigation)}
			/>
		);
	};
};

export default renderOverlay;
