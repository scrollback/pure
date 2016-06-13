/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import type { NavigationState } from '../../../../lib/RouteTypes';

const {
	NavigationExperimental,
	BackAndroid,
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

const {
	Transitioner: NavigationTransitioner,
} = NavigationExperimental;

type Props = {
	navigationState: NavigationState;
	onNavigate: Function;
	onGoBack: Function;
	style?: any;
}

export default class NavigationView extends Component<void, Props, void> {
	static propTypes = {
		navigationState: PropTypes.object.isRequired,
		onNavigate: PropTypes.func.isRequired,
		onGoBack: PropTypes.func,
		style: PropTypes.any,
	};

	componentDidMount() {
		BackAndroid.addEventListener('hardwareBackPress', this._handleGoBack);
	}

	componentWillUnmount() {
		BackAndroid.removeEventListener('hardwareBackPress', this._handleGoBack);
	}

	_handleGoBack = () => {
		const {
			onGoBack,
			navigationState,
		} = this.props;

		if (onGoBack && onGoBack()) {
			return true;
		}

		if (navigationState && navigationState.routes && navigationState.routes.length > 1) {
			this.props.onNavigate({ type: 'pop' });
			return true;
		}

		return false;
	};

	render() {
		return <NavigationTransitioner {...this.props} style={[ styles.container, this.props.style ]} />;
	}
}
