/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import ChatSuggestions from '../views/Chat/ChatSuggestions';
import store from '../../../modules/store/store';
import type { User } from '../../../lib/schemaTypes';

type Props = {
	user: string;
	prefix: string;
}

type State = {
	prefix: string;
	data: Array<User>;
}

export default class ChatSuggestionsContainer extends Component<void, Props, State> {
	static propTypes = {
		prefix: PropTypes.string,
		user: PropTypes.string,
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

	_getResults = (prefix: string) => {
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
				after: 5,
			},
			source: 'ChatSuggestionsContainer',
		});
	};

	_handlePrefixChange = (prefix: string) => {
		if (this._subscription) {
			this._subscription.unsubscribe();
		}
		if (typeof prefix === 'string' && prefix) {
			this.setState({
				prefix,
			});
			this._subscription = this._getResults(prefix).subscribe({
				next: results => {
					if (prefix === this.state.prefix) {
						this.setState({
							data: results.filter(item => item.type !== 'loading' && item.id !== this.props.user),
						});
					}
				},
			});
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
