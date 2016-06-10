/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import PageLoading from '../Page/PageLoading';
import ChatMessagesContainer from '../../containers/ChatMessagesContainer';
import ChatInput from './ChatInput';

const {
	View,
	StyleSheet,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

type Props = {
	room: string;
	thread: string;
	user: string;
	sendMessage: Function;
	onNavigate: Function;
}

export default class Chat extends Component<void, Props, void> {
	static propTypes = {
		room: PropTypes.string.isRequired,
		thread: PropTypes.string.isRequired,
		user: PropTypes.string.isRequired,
		sendMessage: PropTypes.func.isRequired,
		onNavigate: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_input: Object;

	_quoteMessage = (text: string) => {
		this._input.setQuotedText(text);
	};

	_replyToMessage = (user: string) => {
		this._input.setReplyTo(user);
	};

	render() {
		if (!this.props.user) {
			return <PageLoading />;
		}

		return (
			<View {...this.props}>
				<ChatMessagesContainer
					style={styles.container}
					room={this.props.room}
					thread={this.props.thread}
					user={this.props.user}
					quoteMessage={this._quoteMessage}
					replyToMessage={this._replyToMessage}
					onNavigate={this.props.onNavigate}
				/>

				<ChatInput
					ref={c => (this._input = c)}
					room={this.props.room}
					thread={this.props.thread}
					user={this.props.user}
					sendMessage={this.props.sendMessage}
				/>
			</View>
		);
	}
}
