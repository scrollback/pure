/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowEqual from 'shallowequal';
import Connect from '../../../modules/store/Connect';
import PassUserProp from '../../../modules/store/PassUserProp';
import Discussions from '../views/Discussions';
import { TAG_POST_HIDDEN, TAG_USER_ADMIN } from '../../../lib/Constants';
import type { SubscriptionRange } from '../../../modules/store/SimpleStoreTypes';

const CTA = { type: 'cta' };

const transformThreads = (results, me) => {
	const data = me && me.tags && me.tags.indexOf(TAG_USER_ADMIN) >= 0 ? results.reverse() : results.filter(item => {
		return (me.id === item.creator) || !(item.tags && item.tags.indexOf(TAG_POST_HIDDEN) > -1);
	}).reverse();

	if (data.length > 3) {
		data.splice(3, 0, CTA);
	}

	return data;
};

class DiscussionsContainerInner extends Component<void, any, void> {
	static propTypes = {
		data: PropTypes.arrayOf(PropTypes.object).isRequired,
		me: PropTypes.shape({
			tags: PropTypes.arrayOf(PropTypes.number),
		}).isRequired,
	};

	render() {
		const {
			data,
			me,
		} = this.props;

		return <Discussions {...this.props} data={transformThreads(data, me)} />;
	}
}

type State = {
	range: SubscriptionRange;
	defer: boolean;
}

class DiscussionsContainer extends Component<void, any, State> {
	static propTypes = {
		room: PropTypes.string.isRequired,
		user: PropTypes.string.isRequired,
	};

	state: State = {
		range: {
			start: Infinity,
			before: 20,
			after: 0,
		},
		defer: true,
	};

	shouldComponentUpdate(nextProps: any, nextState: State): boolean {
		return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
	}

	componentWillUpdate() {
		if (this.state.defer) {
			this.setState({ defer: false });
		}
	}

	_loadMore: Function = (count: number) => {
		const { range } = this.state;
		const { before } = range;

		this.setState({
			range: {
				...range,
				before: before && before > (count + 10) ? before : count + 20,
			},
		});
	};

	render() {
		const {
			range,
			defer,
		} = this.state;

		return (
			<Connect
				mapSubscriptionToProps={{
					data: {
						key: {
							slice: {
								type: 'thread',
								filter: {
									parents_cts: [ this.props.room ],
								},
								order: 'createTime',
							},
							range,
						},
						defer,
					},
					me: {
						key: {
							type: 'entity',
							id: this.props.user,
						},
					},
				}}
				passProps={{ ...this.props, loadMore: count => this._loadMore(count) }}
				component={DiscussionsContainerInner}
			/>
		);
	}
}

export default PassUserProp(DiscussionsContainer);
