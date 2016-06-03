/* @flow */

import { Component, PropTypes } from 'react';
import { NavigationExperimental } from 'react-native';
import type { NavigationState, NavigationAction } from '../../../../lib/RouteTypes';
import v4 from 'node-uuid';

const {
	StateUtils: NavigationStateUtils,
} = NavigationExperimental;

type Props = {
	initialState: NavigationState;
	renderNavigator: Function;
}

type State = {
    navigation: NavigationState;
}

export default class NavigationRootContainer extends Component<void, Props, State> {
	static propTypes = {
		renderNavigator: PropTypes.func.isRequired,
	};

	constructor(props: Props) {
		super(props);

		const { index, children } = this.props.initialState;

		this.state = {
			navigation: {
				index,
				key: 'root',
				children: children.map(route => ({ key: v4(), ...route })),
			},
		};
	}

	state: State;

	_reduceState = (currentState: NavigationState, action: NavigationAction) => {
		switch (action.type) {
		case 'push':
			if (action.payload) {
				return NavigationStateUtils.push(currentState, { key: v4(), ...action.payload });
			}
			return currentState;
		case 'pop':
		case 'back':
			return currentState.index > 0 ?
				NavigationStateUtils.pop(currentState) :
				currentState;
		default:
			return currentState;
		}
	};

	_handleNavigate = (action: NavigationAction) => {
		const nextNavigationState = this._reduceState(this.state.navigation, action);

		this.setState({
			navigation: nextNavigationState,
		});
	};

	render() {
		return this.props.renderNavigator({
			onNavigate: (action) => this._handleNavigate(action),
			navigationState: this.state.navigation,
		});
	}
}
