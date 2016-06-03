/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import type { NavigationState } from '../../../../lib/RouteTypes';

const {
	NavigationExperimental,
	BackAndroid,
} = ReactNative;

const {
	CardStack: NavigationCardStack,
} = NavigationExperimental;

type Props = {
	navigationState: NavigationState;
	onNavigate: Function;
	onGoBack: Function;
}

export default class NavigationView extends Component<void, Props, void> {
	static propTypes = {
		navigationState: PropTypes.object.isRequired,
		onNavigate: PropTypes.func.isRequired,
		onGoBack: PropTypes.func,
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

		if (navigationState && navigationState.children && navigationState.children.length > 1) {
			this.props.onNavigate({ type: 'pop' });
			return true;
		}

		return false;
	};

	render() {
		return <NavigationCardStack direction='vertical' {...this.props} />;
	}
}
