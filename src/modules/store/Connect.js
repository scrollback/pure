/* @flow */
/* eslint-disable react/sort-comp */

import React, { Component, PropTypes } from 'react';
import shallowEqual from 'shallowequal';
import isEqual from 'lodash/isEqual';
import storeShape from './storeShape';

import type {
	Subscription,
	MapSubscriptionToProps,
	MapActionsToProps,
} from './ConnectTypes';

type Props = {
	mapSubscriptionToProps?: MapSubscriptionToProps;
	mapActionsToProps?: MapActionsToProps;
	passProps?: any;
	component: ReactClass;
	defer?: boolean;
}

type State = {
	[key: string]: any;
}

export default class Connect extends Component<void, Props, State> {
	static contextTypes = {
		store: storeShape.isRequired,
	};

	static propTypes = {
		mapSubscriptionToProps: PropTypes.object,
		mapActionsToProps: PropTypes.object,
		passProps: PropTypes.any,
		component: PropTypes.any.isRequired,
	};

	state: State = {};

	_mounted: boolean = false;
	_subscriptions: Array<Subscription> = [];

	_addSubscriptions: Function = (props, context) => {
		const {
			store,
		} = context;

		const {
			mapSubscriptionToProps,
			component,
		} = props;

		if (typeof store !== 'object') {
			throw new Error('No store was found. Have you wrapped the root component in <StoreProvider /> ?');
		}

		if (mapSubscriptionToProps) {
			for (const item in mapSubscriptionToProps) {
				const sub = mapSubscriptionToProps[item];
				const defer = sub.defer;
				const source = component.displayName || component.name;

				let listener;

				switch (typeof sub) {
				case 'string':
					listener = store.subscribe(
						{
							type: sub,
							source,
							defer,
						},
						this._updateListener(item)
					);
					break;
				case 'object':
					listener = store.subscribe(
						typeof sub.key === 'string' ? { type: sub.key, source, defer } : { ...sub.key, source, defer },
						this._updateListener(item, sub.transform)
					);
					break;
				default:
					throw new Error(`Invalid subscription ${item}. Subscription must be a string or an object.`);
				}

				if (listener) {
					this._subscriptions.push(listener);
				}
			}
		}
	};

	_removeSubscriptions: Function = () => {
		if (this._subscriptions) {
			for (let i = 0, l = this._subscriptions.length; i < l; i++) {
				this._subscriptions[i].remove();
			}

			this._subscriptions = [];
		}
	};

	_renewSubscriptions: Function = (props, context) => {
		this._removeSubscriptions();
		this._addSubscriptions(props, context);
	};

	_updateListener: Function = (name, transform) => {
		return data => {
			if (this._mounted) {
				this.setState({
					[name]: transform ? transform(data, this.props) : data,
				});
			}
		};
	};

	componentDidMount() {
		this._mounted = true;
		this._addSubscriptions(this.props, this.context);
	}

	componentWillReceiveProps(nextProps: Props) {
		if (isEqual(this.props.mapSubscriptionToProps, nextProps.mapSubscriptionToProps)) {
			return;
		}

		this._renewSubscriptions(nextProps, this.context);
	}

	componentWillUnmount() {
		this._mounted = false;
		this._removeSubscriptions();
	}

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
	}

	render(): ?React.Element<any> {
		const {
			state,
		} = this;

		const {
			mapActionsToProps,
			mapSubscriptionToProps,
			passProps,
			component: ChildComponent,
		} = this.props;

		if (state && mapSubscriptionToProps) {
			const stateKeys = Object.keys(state);

			for (const key in mapSubscriptionToProps) {
				if (stateKeys.indexOf(key) === -1) {
					return null;
				}
			}
		}

		const {
			store,
		} = this.context;

		const actions = {};

		for (const key in mapActionsToProps) {
			actions[key] = mapActionsToProps[key](store, state, passProps);
		}

		return (
			<ChildComponent
				{...passProps}
				{...state}
				{...actions}
			/>
		);
	}
}
