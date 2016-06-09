/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import memoize from 'lodash/memoize';
import createContainer from './createContainer';

import type {
	SubscriptionSlice,
	SubscriptionRange,
} from './SimpleStoreTypes';

type SliceFromProps = (props: any) => SubscriptionSlice;

type State = SubscriptionRange;

export default function(sliceFromProps: SliceFromProps, pageSize: number) {
	return function(ChildComponent: ReactClass<any>): ReactClass<any> {
		class ChildComponentWrapper extends Component<void, any, void> {
			static propTypes = {
				data: PropTypes.array.isRequired,
				loadMore: PropTypes.func.isRequired,
			};

			_loadMore = () => {
				const {
					data,
					loadMore,
				} = this.props;

				loadMore(data ? data.length : pageSize);
			};

			render() {
				return (
					<ChildComponent
						{...this.props}
						loadMore={this._loadMore}
					/>
				);
			}
		}

		const Container = createContainer(
			({ paginationProps }) => ({
				data: {
					key: {
						slice: paginationProps.slice,
						range: paginationProps.range,
					},
					defer: paginationProps.defer,
				},
			})
		)(ChildComponentWrapper);

		class PaginatedContainer extends Component<void, any, State> {
			state: State = {
				start: Infinity,
				before: pageSize,
				after: 0,
			};

			componentWillMount() {
				this._sliceFromProps = memoize(sliceFromProps);
			}

			shouldComponentUpdate(nextProps: any, nextState: State): boolean {
				return shallowCompare(this, nextProps, nextState);
			}

			componentWillUpdate() {
				this._updated = true;
			}

			_updated: ?boolean;
			_sliceFromProps: SliceFromProps;

			_loadMore: Function = (count: number) => {
				const { before } = this.state;

				this.setState({
					before: before && before > count + 1 ? before : count + pageSize,
				});
			};

			render() {
				return (
					<Container
						{...this.props}
						loadMore={this._loadMore}
						paginationProps={{
							slice: this._sliceFromProps(this.props),
							range: this.state,
							defer: this._updated !== true
						}}
					/>
				);
			}
		}

		PaginatedContainer.displayName = `PaginatedContainer$${ChildComponent.displayName || ChildComponent.name}`;

		return PaginatedContainer;
	};
}
