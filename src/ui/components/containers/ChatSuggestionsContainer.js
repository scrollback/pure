/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import createContainer from '../../../modules/store/createContainer';
import ChatSuggestions from '../views/Chat/ChatSuggestions';
import store from '../../../modules/store/store';
import type { Text } from '../../../lib/schemaTypes';

type Props = {
	user: string;
	prefix: string;
	texts: Array<Text>;
}

type State = {
	prefix: string;
	data: Array<{ id: string }>;
}

class ChatSuggestionsContainerInner extends Component<void, Props, State> {
	static propTypes = {
		prefix: PropTypes.string.isRequired,
		user: PropTypes.string.isRequired,
		texts: PropTypes.arrayOf(PropTypes.object).isRequired,
	};

	state: State = {
		prefix: '',
		data: [],
	};

	componentWillMount() {
		this._handlePrefixChange(this.props.prefix);
	}

	componentWillReceiveProps(nextProps: Props) {
		this._handlePrefixChange(nextProps.prefix);
	}

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_subscription: ?Subscription;

	_getResults = (prefix: string, count: number) => {
		return store.observe({
			slice: {
				type: 'user',
				filter: {
					id_pref: prefix,
				},
				order: 'updateTime',
			},
			range: {
				start: -Infinity,
				before: 0,
				after: count,
			},
			source: 'ChatSuggestionsContainer',
		});
	};

	_getUsersFromTexts = (texts: Array<Text>) => {
		return texts.map(text => {
			return text.creator || null;
		}).filter((value, index, self) => {
			return self.indexOf(value) === index;
		});
	};

	_handlePrefixChange = (prefix: string) => {
		if (this._subscription) {
			this._subscription.unsubscribe();
			this._subscription = null;
		}
		if (typeof prefix === 'string' && prefix) {
			this.setState({
				prefix,
			});
			const users = this._getUsersFromTexts(this.props.texts)
				.filter(id => {
					return typeof id === 'string' && id && id !== this.props.user && id.indexOf(prefix.substring(1)) === 0;
				}).map(id => {
					return { id };
				});
			this.setState({
				data: users,
			});
			if (users.length < 4 && prefix.length > 1) {
				this._subscription = this._getResults(prefix.substring(1), 4 - users.length).subscribe({
					next: (result) => {
						if (prefix === this.state.prefix) {
							const currentIds = [];
							const items = users
								.concat(result)
								.filter((item: any) => item.type !== 'loading' && item.id !== this.props.user);

							items.forEach(user => {
								currentIds.push(user.id);
							});

							this.setState({
								data: items.filter((user, index) => {
									return currentIds.indexOf(user.id) === index;
								}),
							});
						}
					},
				});
			}
		} else {
			this.setState({
				prefix: '',
				data: [],
			});
		}
	};

	render() {
		const {
			prefix,
			data,
		} = this.state;

		if (!prefix) {
			return null;
		}

		return <ChatSuggestions data={data} {...this.props} />;
	}
}

const mapSubscriptionToProps = ({ thread }) => ({
	texts: {
		key: {
			slice: {
				type: 'text',
				filter: {
					parents_first: thread,
				},
				order: 'createTime',
			},
			range: {
				start: Infinity,
				before: 30,
				after: 0,
			},
		},
		defer: false,
	},
});

export default createContainer(mapSubscriptionToProps)(ChatSuggestionsContainerInner);
