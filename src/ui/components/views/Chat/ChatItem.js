/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import ChatBubble from './ChatBubble';
import ChatAvatar from './ChatAvatar';
import ChatTimestamp from './ChatTimestamp';
import ChatText from './ChatText';
import ChatLikeButtonContainer from '../../containers/ChatLikeButtonContainer';
import ChatActionSheetContainer from '../../containers/ChatActionSheetContainer';
import { TAG_POST_HIDDEN } from '../../../../lib/Constants';
import type { Text, TextRel } from '../../../../lib/schemaTypes';

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
	timestampRight: {
		alignSelf: 'flex-end',
	},
	chatReceived: {
		paddingRight: 52,
	},
	chatSent: {
		marginHorizontal: 8,
		paddingLeft: 44,
	},
	hidden: {
		opacity: 0.3,
	},
	like: {
		position: 'absolute',
		top: 0,
		width: 52,
		alignItems: 'center',
	},
	likeReceived: {
		right: 0,
	},
	likeSent: {
		left: -8,
	},
});

type Props = {
	text: Text;
	textrel: ?TextRel;
	previousText: ?Text;
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

export default class ChatItem extends Component<void, Props, State> {
	static propTypes = {
		text: PropTypes.shape({
			body: PropTypes.string.isRequired,
			creator: PropTypes.string.isRequired,
			createTime: PropTypes.number.isRequired,
			meta: PropTypes.object,
		}).isRequired,
		textrel: PropTypes.object,
		previousText: PropTypes.shape({
			creator: PropTypes.string,
			createTime: PropTypes.number,
		}),
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
			text,
			previousText,
			user,
			showTimestamp,
		} = this.props;

		const hidden = text.tags && text.tags.indexOf(TAG_POST_HIDDEN) > -1;
		const received = text.creator !== user;

		let showAuthor = received;

		if (previousText) {
			if (received) {
				showAuthor = text.creator !== previousText.creator;
			}
		}

		return (
			<View {...this.props} style={[ styles.container, this.props.style ]}>
				<View style={[ styles.chat, received ? styles.received : null, hidden ? styles.hidden : null ]}>
					{received && showAuthor ?
						<ChatAvatar user={text.creator} onNavigate={this.props.onNavigate} /> :
						null
					}

					<View style={received ? styles.chatReceived : styles.chatSent}>
						<TouchableOpacity activeOpacity={0.5} onPress={this._handleShowMenu}>
							<ChatBubble
								author={text.creator}
								alignment={received ? 'left' : 'right'}
								showAuthor={showAuthor}
								showArrow={received ? showAuthor : true}
							>
								<ChatText body={text.body} meta={text.meta} />
							</ChatBubble>
						</TouchableOpacity>

						<ChatLikeButtonContainer
							style={[ styles.like, received ? styles.likeReceived : styles.likeSent ]}
							text={this.props.text}
							textrel={this.props.textrel}
						/>
					</View>
				</View>

				{showTimestamp ?
					<ChatTimestamp style={received ? styles.timestampLeft : styles.timestampRight} time={text.createTime} /> :
					null
				}

				<ChatActionSheetContainer
					text={text}
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
