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

	_reduceState = (currentState: NavigationState, { type, payload }: NavigationAction) => {
		switch (type) {
		case 'push':
			if (payload) {
				return NavigationStateUtils.push(currentState, payload);
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

	_handleNavigate = ({ type, payload }: NavigationAction) => {
		const nextNavigationState = this._reduceState(this.state.navigation, {
			type,
			payload: {
				key: v4(),
				...payload,
			},
		});

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
