/* @flow */

import { Component, PropTypes } from 'react';
import { AsyncStorage } from 'react-native';
import type { NavigationState, NavigationAction } from '../../../../lib/RouteTypes';
import { v4 } from 'node-uuid';

type Props = {
	persistenceKey: ?string;
	initialState: NavigationState;
	renderNavigator: Function;
}

type State = {
	restoringState: boolean;
	navigation: NavigationState;
}

export default class NavigationRoot extends Component<void, Props, State> {
	static propTypes = {
		renderNavigator: PropTypes.func.isRequired,
	};

	constructor(props: Props) {
		super(props);

		const { index, routes } = this.props.initialState;

		this.state = {
			restoringState: false,
			navigation: {
				index,
				key: 'root',
				routes: routes.map(route => ({ key: v4(), ...route })),
			},
		};
	}

	state: State;

	componentWillMount() {
		this._restoreNavigationState();
	}

	_persistNavigationState = async (currentState: NavigationState) => {
		const { persistenceKey } = this.props;

		if (persistenceKey) {
			await AsyncStorage.setItem(persistenceKey, JSON.stringify(currentState));
		}
	};

	_restoreNavigationState = async () => {
		const { persistenceKey } = this.props;

		if (persistenceKey) {
			this.setState({
				restoringState: true,
			});

			const savedStateString = await AsyncStorage.getItem(persistenceKey);

			try {
				const savedState = JSON.parse(savedStateString);
				if (savedState) {
					this.setState({
						navigation: savedState,
					});
				}
			} catch (e) {
				// ignore
			}
		}

		this.setState({
			restoringState: false,
		});
	};

	_reduceState = (currentState: NavigationState, { type, payload }: NavigationAction) => {
		const {
			index,
			routes,
		} = currentState;

		switch (type) {
		case 'push':
			if (payload) {
				return {
					...currentState,
					routes: [
						...routes,
						payload,
					],
					index: index + 1,
				};
			}
			return currentState;
		case 'pop':
		case 'back':
			if (index > 0 && routes.length > 1) {
				return {
					...currentState,
					routes: routes.slice(0, routes.length - 1),
					index: index - 1,
				};
			}
			return currentState;
		default:
			return currentState;
		}
	};

	_handleNavigate = ({ type, payload }: NavigationAction) => {
		const nextNavigationState = this._reduceState(this.state.navigation, {
			type,
			payload: { key: v4(), ...payload },
		});

		this.setState({
			navigation: nextNavigationState,
		});
		this._persistNavigationState(nextNavigationState);
	};

	render() {
		if (this.state.restoringState) {
			return null;
		}

		return this.props.renderNavigator({
			onNavigate: action => this._handleNavigate(action),
			navigationState: this.state.navigation,
		});
	}
}
