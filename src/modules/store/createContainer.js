/* @flow */

import React, { Component } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import memoize from 'lodash/memoize';
import storeShape from './storeShape';

import type {
	SubscriptionPropsMap,
	DispatchPropsMap,
} from './createContainerTypes';

type MapSubscriptionToProps = (props: any) => SubscriptionPropsMap;
type MapDispatchToProps = (dispatch: Function) => DispatchPropsMap;

type State = {
	[key: string]: any;
}

export default function(mapSubscriptionToProps?: ?MapSubscriptionToProps, mapDispatchToProps?: ?MapDispatchToProps) {
	return function(ChildComponent: any) {
		class Container extends Component<void, any, State> {
			static contextTypes = {
				store: storeShape.isRequired,
			};

			state: State = {};

			componentWillMount() {
				const {
					store,
				} = this.context;

				if (mapDispatchToProps) {
					this._actions = mapDispatchToProps(store.put.bind(store));
				}

				if (mapSubscriptionToProps) {
					this._mapSubscriptionToProps = memoize(mapSubscriptionToProps);
					this._currentSubscriptionPropsMap = mapSubscriptionToProps(this.props);
					this._addSubscriptions(store, this._currentSubscriptionPropsMap);
				}
			}

			componentWillReceiveProps(nextProps: any) {
				const nextSubscriptionPropsMap = this._mapSubscriptionToProps(nextProps);

				if (this._currentSubscriptionPropsMap !== nextSubscriptionPropsMap) {
					this._currentSubscriptionPropsMap = nextSubscriptionPropsMap;
					this._renewSubscriptions(this.context.store, nextSubscriptionPropsMap);
				}
			}

			shouldComponentUpdate(nextProps: any, nextState: any): boolean {
				return shallowCompare(this, nextProps, nextState);
			}

			componentWillUnmount() {
				this._removeSubscriptions();
			}

			_currentSubscriptionPropsMap: ?SubscriptionPropsMap;
			_mapSubscriptionToProps: Function;
			_actions: { [key: string]: Function };
			_subscriptions: Array<Subscription> = [];

			_addSubscriptions: Function = (store, subscriptionPropsMap) => {
				if (typeof store !== 'object') {
					throw new Error('No store was found. Have you wrapped the root component in <StoreProvider /> ?');
				}

				if (subscriptionPropsMap) {
					for (const item in subscriptionPropsMap) {
						const sub = subscriptionPropsMap[item];
						const defer = sub.defer !== false;
						const source = ChildComponent.displayName || ChildComponent.name;

						let listener;

						switch (typeof sub) {
						case 'string':
							listener = store.observe({
								type: sub,
								source,
								defer,
							}).subscribe(
								this._createUpdateObserver(item),
							);
							break;
						case 'object':
							listener = store.observe(
								typeof sub.key === 'string' ? { type: sub.key, source, defer } : { ...sub.key, source, defer },
							).subscribe(
								this._createUpdateObserver(item, sub.transform),
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
						this._subscriptions[i].unsubscribe();
					}

					this._subscriptions = [];
				}
			};

			_renewSubscriptions: Function = (store, subscriptionPropsMap) => {
				this._removeSubscriptions();
				this._addSubscriptions(store, subscriptionPropsMap);
			};

			_createUpdateObserver: Function = (name, transform) => {
				const next = data => {
					this.setState({
						[name]: transform ? transform(data, this.props) : data,
					});
				};

				return { next };
			};

			render() {
				const { state } = this;
				const currentSubscriptionPropsMap = this._currentSubscriptionPropsMap;

				if (state && currentSubscriptionPropsMap) {
					const stateKeys = Object.keys(state);

					for (const key in currentSubscriptionPropsMap) {
						if (stateKeys.indexOf(key) === -1) {
							return null;
						}
					}
				}

				return (
					<ChildComponent
						{...this.props}
						{...this.state}
						{...this._actions}
					/>
				);
			}
		}

		Container.displayName = `Container$${ChildComponent.displayName || ChildComponent.name}`;

		return Container;
	};
}
