/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import Connect from '../../../modules/store/Connect';
import ChatSuggestions from '../views/Chat/ChatSuggestions';

type Props = {
	user: string;
	prefix: string;
}

type State = {
	prefix: string;
}

export default class ChatSuggestionsContainer extends Component<void, Props, State> {
	static propTypes = {
		user: PropTypes.string,
	};

	state: State = {
		prefix: '',
	};

	componentWillReceiveProps(nextProps: Props) {
		if (typeof nextProps.prefix === 'string') {
			this.setState({
				prefix: nextProps.prefix.trim(),
			});
		}
	}

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		const {
			prefix,
		} = this.state;
		const {
			user,
		} = this.props;

		if (!prefix) {
			return null;
		}

		return (
			<Connect
				mapSubscriptionToProps={{
					data: {
						key: {
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
						},
						transform: results => results.filter(item => item.type !== 'loading' && item.id !== user),
					},
				}}
				passProps={this.props}
				component={ChatSuggestions}
			/>
		);
	}
}
