/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import Connect from '../../../modules/store/Connect';
import ChatMessages from '../views/Chat/ChatMessages';
import { TAG_POST_HIDDEN, TAG_USER_ADMIN } from '../../../lib/Constants';
import type { SubscriptionRange } from '../../../modules/store/SimpleStoreTypes';

const transformTexts = (texts, thread) => {
	const data = [];

	for (let l = texts.length - 1, i = l; i >= 0; i--) {
		if (texts[i].type === 'loading') {
			data.push(texts[i]);
		} else {
			data.push({
				text: texts[i],
				previousText: texts[i - 1],
				isLast: i === l,
			});
		}
	}

	if (thread && thread.type !== 'loading') {
		const first = data[data.length - 1];

		if (first && first.text) {
			data[data.length - 1] = {
				text: first.text,
				previousText: thread,
				isLast: false,
			};
		}

		data.push({ text: thread });
	}

	return data;
};

const filterHidden = (results, me) => me && me.tags && me.tags.indexOf(TAG_USER_ADMIN) > -1 ? results : results.filter(item => {
	return (me.id === item.creator) || !(item.tags && item.tags.indexOf(TAG_POST_HIDDEN) > -1);
});

class ChatMessagesContainerInner extends Component<void, any, void> {
	static propTypes = {
		data: PropTypes.arrayOf(PropTypes.object).isRequired,
		thread: PropTypes.object,
		me: PropTypes.shape({
			tags: PropTypes.arrayOf(PropTypes.number),
		}).isRequired,
	};

	render() {
		const {
			thread,
			data,
			me,
		} = this.props;

		return <ChatMessages {...this.props} data={transformTexts(filterHidden(data, me), thread)} />;
	}
}

type State = {
	range: SubscriptionRange;
	defer: boolean;
}

export default class ChatMessagesContainer extends Component<void, any, State> {
	static propTypes = {
		thread: PropTypes.string.isRequired,
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
		return shallowCompare(this, nextProps, nextState);
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
				before: before && before > (count + 20) ? before : count + 40,
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
								type: 'text',
								filter: {
									parents_cts: [ this.props.thread ],
								},
								order: 'createTime',
							},
							range,
						},
						defer,
					},
					thread: {
						key: {
							type: 'entity',
							id: this.props.thread,
						},
					},
					me: {
						key: {
							type: 'entity',
							id: this.props.user,
						},
					},
				}}
				passProps={{ ...this.props, loadMore: count => this._loadMore(count) }}
				component={ChatMessagesContainerInner}
			/>
		);
	}
}
