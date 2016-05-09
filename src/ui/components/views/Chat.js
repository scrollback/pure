/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import PageLoading from './PageLoading';
import ChatMessagesContainer from '../containers/ChatMessagesContainer';
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
	onNavigation: Function;
}

export default class Chat extends Component<void, Props, void> {
	static propTypes = {
		room: PropTypes.string.isRequired,
		thread: PropTypes.string.isRequired,
		user: PropTypes.string.isRequired,
		sendMessage: PropTypes.func.isRequired,
		onNavigation: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	_input: Object;

	_quoteMessage: Function = (text: string) => {
		this._input.setQuotedText(text);
	};

	_replyToMessage: Function = (user: string) => {
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
					onNavigation={this.props.onNavigation}
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
