/* @flow */

import { Component, PropTypes } from 'react';
import type { NavigationState } from '../../../../lib/RouteTypes';

type Props = {
	navigation: NavigationState;
	renderNavigator: Function;
	onNavigate: Function;
}

export default class NavigationRoot extends Component<void, Props, void> {
	static propTypes = {
		navigation: PropTypes.object.isRequired,
		renderNavigator: PropTypes.func.isRequired,
		onNavigate: PropTypes.func.isRequired,
	};

	render() {
		if (this.props.navigation.restoring) {
			return null;
		}

		return this.props.renderNavigator({
			onNavigate: this.props.onNavigate,
			navigationState: this.props.navigation,
		});
	}
}
