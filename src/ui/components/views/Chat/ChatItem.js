/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AvatarRound from '../Avatar/AvatarRound';
import ChatBubble from './ChatBubble';
import Embed from '../Embed/Embed';
import Icon from '../Core/Icon';
import Time from '../Core/Time';
import ActionSheet from '../Core/ActionSheet';
import ActionSheetItem from '../Core/ActionSheetItem';
import AppText from '../Core/AppText';
import Colors from '../../../Colors';
import { parseURLs } from '../../../../lib/URL';
import { TAG_POST_HIDDEN, ROLE_UPVOTE } from '../../../../lib/Constants';
import type { Text, TextRel } from '../../../../lib/schemaTypes';

const {
	Clipboard,
	Linking,
	ToastAndroid,
	PixelRatio,
	StyleSheet,
	TouchableOpacity,
	View,
} = ReactNative;

const FADED_GREY = '#b2b2b2';

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
	timestamp: {
		flexDirection: 'row',
		marginTop: 4,
	},
	timestampLeft: {
		marginLeft: 52,
	},
	timestampRight: {
		alignSelf: 'flex-end',
	},
	timestampIcon: {
		color: FADED_GREY,
		marginVertical: 2,
	},
	timestampText: {
		color: FADED_GREY,
		fontSize: 12,
		lineHeight: 18,
		marginHorizontal: 6,
		paddingHorizontal: 8,
	},
	avatar: {
		position: 'absolute',
		top: 0,
		left: -36,
		alignSelf: 'flex-end',
	},
	thumbnail: {
		marginVertical: 4,
	},
	embed: {
		borderColor: 'rgba(0, 0, 0, .24)',
		borderWidth: 1 / PixelRatio.get(),
		padding: 8,
		marginVertical: 4,
		borderRadius: 2,
	},
	embedThumbnail: {
		marginBottom: 8,
	},
	chatReceived: {
		paddingRight: 52,
	},
	chatSent: {
		marginLeft: 8,
	},
	hidden: {
		opacity: 0.3,
	},
	action: {
		position: 'absolute',
		right: 0,
		bottom: 0,
		width: 52,
		alignItems: 'center',
	},
	icon: {
		color: FADED_GREY,
	},
	likeCount: {
		color: FADED_GREY,
		fontSize: 10,
		lineHeight: 15,
	},
	liked: {
		color: Colors.accent,
	},
});

type Props = {
	text: Text;
	textrel: TextRel;
	previousText: Text;
	isFirst: boolean;
	isLast: boolean;
	user: string;
	quoteMessage: Function;
	replyToMessage: Function;
	isUserAdmin: boolean;
	hideText: Function;
	unhideText: Function;
	likeText: Function;
	unlikeText: Function;
	banUser: Function;
	unbanUser: Function;
	style?: any;
	onNavigate: Function;
};

type State = {
	actionSheetVisible: boolean;
	likes: number;
}

export default class ChatItem extends Component<void, Props, State> {
	static propTypes = {
		text: PropTypes.shape({
			body: PropTypes.string.isRequired,
			creator: PropTypes.string.isRequired,
			createTime: PropTypes.number.isRequired,
			meta: PropTypes.object,
		}).isRequired,
		textrel: PropTypes.object.isRequired,
		previousText: PropTypes.shape({
			body: PropTypes.string.isRequired,
			creator: PropTypes.string.isRequired,
			createTime: PropTypes.number.isRequired,
		}),
		isFirst: PropTypes.bool,
		isLast: PropTypes.bool,
		user: PropTypes.string.isRequired,
		quoteMessage: PropTypes.func.isRequired,
		replyToMessage: PropTypes.func.isRequired,
		isUserAdmin: PropTypes.bool.isRequired,
		hideText: PropTypes.func.isRequired,
		unhideText: PropTypes.func.isRequired,
		likeText: PropTypes.func.isRequired,
		unlikeText: PropTypes.func.isRequired,
		banUser: PropTypes.func.isRequired,
		unbanUser: PropTypes.func.isRequired,
		style: View.propTypes.style,
		onNavigate: PropTypes.func.isRequired,
	};

	state: State = {
		actionSheetVisible: false,
		likes: 0,
	};

	componentDidMount() {
		this._updateLikeCount(this.props.text);
	}

	componentWillReceiveProps(nextProps: Props) {
		if (this._compareLikeCount(this.props.text, nextProps.text)) {
			this._updateLikeCount(nextProps.text);
		}
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_compareLikeCount = (currentText: Text, nextText: Text) => {
		const currentCount = currentText.counts && currentText.counts.upvote ? currentText.counts.upvote : 0;
		const nextCount = nextText.counts && nextText.counts.upvote ? nextText.counts.upvote : 0;

		return currentCount !== nextCount;
	}

	_updateLikeCount = (text: Text) => {
		const likes = text.counts && text.counts.upvote ? text.counts.upvote : 0;

		this.setState({
			likes,
		});
	};

	_isLiked: Function = () => {
		const {
			textrel,
		} = this.props;

		return textrel && textrel.roles ? textrel.roles.indexOf(ROLE_UPVOTE) > -1 : false;
	};

	_handleLike: Function = () => {
		if (this._isLiked()) {
			this.props.unlikeText();
		} else {
			this.props.likeText();
		}
	};

	_goToProfile: Function = () => {
		const { text } = this.props;

		this.props.onNavigate({
			type: 'push',
			payload: {
				name: 'profile',
				props: {
					user: text.creator,
				},
			},
		});
	};

	_copyToClipboard: Function = text => {
		Clipboard.setString(text);
		ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
	};

	_handleOpenImage: Function = () => {
		const { text } = this.props;

		if (text.meta) {
			const { photo } = text.meta;

			Linking.openURL(photo.url);
		}
	};

	_handleCopyImageLink: Function = () => {
		const { text } = this.props;

		if (text.meta) {
			const { photo } = text.meta;

			this._copyToClipboard(photo.url);
		}
	};

	_handleCopyMessage: Function = () => {
		this._copyToClipboard(this.props.text.body);
	};

	_handleQuoteMessage: Function = () => {
		this.props.quoteMessage(this.props.text);
	};

	_handleReplyToMessage: Function = () => {
		this.props.replyToMessage(this.props.text);
	};

	_handleShowMenu: Function = () => {
		this.setState({
			actionSheetVisible: true,
		});
	};

	_handleRequestClose: Function = () => {
		this.setState({
			actionSheetVisible: false,
		});
	};

	render() {
		const {
			text,
			previousText,
			isLast,
			user,
			isUserAdmin,
		} = this.props;

		const hidden = text.tags && text.tags.indexOf(TAG_POST_HIDDEN) > -1;
		const received = text.creator !== user;
		const links = parseURLs(text.body, 1);

		let cover;

		if (text.meta && text.meta.photo) {
			const { photo } = text.meta;

			cover = (
				<Embed
					url={photo.url}
					data={photo}
					showTitle={false}
					thumbnailStyle={styles.thumbnail}
					openOnPress={false}
				/>
			);
		} else if (links.length) {
			cover = (
				<Embed
					url={links[0]}
					style={styles.embed}
					thumbnailStyle={styles.embedThumbnail}
				/>
			);
		}

		let showAuthor = received,
			showTime = isLast;

		if (previousText) {
			if (received) {
				showAuthor = text.creator !== previousText.creator;
			}

			showTime = showTime || (text.createTime - previousText.createTime) > 300000;
		}

		const liked = this._isLiked();

		return (
			<View {...this.props} style={[ styles.container, this.props.style ]}>
				<View style={[ styles.chat, received ? styles.received : null, hidden ? styles.hidden : null ]}>
					{received && showAuthor ?
						<TouchableOpacity
							activeOpacity={0.5}
							onPress={this._goToProfile}
							style={styles.avatar}
						>
							<AvatarRound size={36} user={text.creator} />
						</TouchableOpacity> :
						null
					}

					<View style={received ? styles.chatReceived : styles.chatSent}>
						<TouchableOpacity activeOpacity={0.5} onPress={this._handleShowMenu}>
							<ChatBubble
								body={text.meta && text.meta.photo ? null : text.body}
								creator={text.creator}
								type={received ? 'left' : 'right'}
								showAuthor={showAuthor}
								showArrow={received ? showAuthor : true}
							>
								{cover}
							</ChatBubble>
						</TouchableOpacity>

						{received ?
							<TouchableOpacity style={styles.action} onPress={this._handleLike}>
								<Icon
									style={[ styles.icon, liked ? styles.liked : null ]}
									name={liked ? 'favorite' : 'favorite-border'}
									size={24}
								/>
								<AppText style={[ styles.likeCount, liked ? styles.liked : null ]}>
									{text.counts && text.counts.upvote ? text.counts.upvote : ''}
								</AppText>
							</TouchableOpacity> :
							null
						}
					</View>
				</View>

				{showTime ?
					(<View style={[ styles.timestamp, received ? styles.timestampLeft : styles.timestampRight ]}>
						<Icon
							name='access-time'
							style={styles.timestampIcon}
							size={12}
						/>
						<Time
							type='long'
							time={text.createTime}
							style={styles.timestampText}
						/>
					</View>) :
					null
				}

				<ActionSheet visible={this.state.actionSheetVisible} onRequestClose={this._handleRequestClose}>
					{text.meta && text.meta.photo ? [
						<ActionSheetItem key='open-image' onPress={this._handleOpenImage}>
							Open image in browser
						</ActionSheetItem>,
						<ActionSheetItem key='copy-imagelink' onPress={this._handleCopyImageLink}>
							Copy image link
						</ActionSheetItem>,
					] : [
						<ActionSheetItem key='copy-text' onPress={this._handleCopyMessage}>
							Copy message text
						</ActionSheetItem>,
						<ActionSheetItem key='quote-text' onPress={this._handleQuoteMessage}>
							Quote message
						</ActionSheetItem>,
					]}

					{user !== text.creator ?
						<ActionSheetItem onPress={this._handleReplyToMessage}>
							{'Reply to @' + text.creator}
						</ActionSheetItem> : null
					}

					{isUserAdmin ?
						hidden ?
							<ActionSheetItem onPress={this.props.unhideText}>
								Unhide message
							</ActionSheetItem> :
							<ActionSheetItem onPress={this.props.hideText}>
								Hide message
							</ActionSheetItem> : null
					}
				</ActionSheet>
			</View>
		);
	}
}
