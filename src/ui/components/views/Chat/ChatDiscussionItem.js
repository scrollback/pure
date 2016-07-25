/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import ChatBubble from './ChatBubble';
import ChatTimestamp from './ChatTimestamp';
import ChatAvatar from './ChatAvatar';
import ChatText from './ChatText';
import DiscussionActionLikeContainer from '../../containers/DiscussionActionLikeContainer';
import ChatActionSheetContainer from '../../containers/ChatActionSheetContainer';
import { TAG_POST_HIDDEN } from '../../../../lib/Constants';
import type { Thread, ThreadRel } from '../../../../lib/schemaTypes';
import Colors from '../../../Colors';

const {
	StyleSheet,
	TouchableOpacity,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		marginVertical: 4,
	},
	chat: {
		flex: 0,
		flexDirection: 'column',
		alignItems: 'flex-end',
	},
	received: {
		alignItems: 'flex-start',
		marginLeft: 44,
	},
	timestampLeft: {
		marginLeft: 52,
	},
	chatReceived: {
		paddingRight: 8,
	},
	hidden: {
		opacity: 0.3,
	},
	title: {
		color: Colors.darkGrey,
		fontSize: 16,
		fontWeight: 'bold',
		marginTop: 4,
		marginHorizontal: 12,
	},
	separator: {
		marginHorizontal: 12,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Colors.separator,
	},
	footer: {
		flexDirection: 'row',
		alignItems: 'center',
	}
});

type Props = {
	thread: Thread;
	threadrel: ?ThreadRel;
	showTimestamp?: boolean;
	user: string;
	quoteMessage: Function;
	replyToMessage: Function;
	style?: any;
	onNavigate: Function;
};

type State = {
	actionSheetVisible: boolean;
}

export default class ChatDiscussionItem extends Component<void, Props, State> {
	static propTypes = {
		thread: PropTypes.shape({
			body: PropTypes.string.isRequired,
			creator: PropTypes.string.isRequired,
			createTime: PropTypes.number.isRequired,
			meta: PropTypes.object,
		}).isRequired,
		threadrel: PropTypes.object,
		showTimestamp: PropTypes.bool,
		user: PropTypes.string.isRequired,
		quoteMessage: PropTypes.func.isRequired,
		replyToMessage: PropTypes.func.isRequired,
		style: View.propTypes.style,
		onNavigate: PropTypes.func.isRequired,
	};

	state: State = {
		actionSheetVisible: false,
	};

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleShowMenu = () => {
		this.setState({
			actionSheetVisible: true,
		});
	};

	_handleRequestClose = () => {
		this.setState({
			actionSheetVisible: false,
		});
	};

	render() {
		const {
			thread,
			threadrel,
			user,
			showTimestamp,
		} = this.props;

		const hidden = thread.tags && thread.tags.indexOf(TAG_POST_HIDDEN) > -1;

		return (
			<View {...this.props} style={[ styles.container, this.props.style ]}>
				<View style={[ styles.chat, styles.received, hidden ? styles.hidden : null ]}>
					<ChatAvatar user={thread.creator} onNavigate={this.props.onNavigate} />

					<View style={styles.chatReceived}>
						<TouchableOpacity activeOpacity={0.5} onPress={this._handleShowMenu}>
							<ChatBubble
								showAuthor
								showArrow
								alignment='left'
								author={thread.creator}
							>
								<AppText style={styles.title}>{thread.name}</AppText>
								{thread.meta && thread.meta.photo ?
									null :
									<ChatText body={thread.body} meta={thread.meta} />
								}

								<View style={styles.separator} />

								<View style={styles.footer}>
									<DiscussionActionLikeContainer
										thread={thread}
										threadrel={threadrel}
										user={user}
									/>
								</View>
							</ChatBubble>
						</TouchableOpacity>
					</View>
				</View>

				{showTimestamp ?
					<ChatTimestamp style={styles.timestampLeft} time={thread.createTime} /> :
					null
				}

				<ChatActionSheetContainer
					text={thread}
					user={user}
					quoteMessage={this.props.quoteMessage}
					replyToMessage={this.props.replyToMessage}
					visible={this.state.actionSheetVisible}
					onRequestClose={this._handleRequestClose}
				/>
			</View>
		);
	}
}
