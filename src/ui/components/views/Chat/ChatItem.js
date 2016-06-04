/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AvatarRound from '../Avatar/AvatarRound';
import ChatBubble from './ChatBubble';
import Embed from '../Embed/Embed';
import Icon from '../Core/Icon';
import Time from '../Core/Time';
import ChatLikeButton from './ChatLikeButton';
import ChatActionSheet from './ChatActionSheet';
import { parseURLs } from '../../../../lib/URL';
import { TAG_POST_HIDDEN } from '../../../../lib/Constants';
import type { Text, TextRel } from '../../../../lib/schemaTypes';

const {
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
		marginHorizontal: 8,
	},
	hidden: {
		opacity: 0.3,
	},
	like: {
		position: 'absolute',
		top: 2,
		right: 0,
		width: 52,
		alignItems: 'center',
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
	};

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

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
							<ChatLikeButton
								style={styles.like}
								text={this.props.text}
								textrel={this.props.textrel}
								likeText={this.props.likeText}
								unlikeText={this.props.unlikeText}
							/> :
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

				<ChatActionSheet
					text={text}
					user={user}
					isUserAdmin={isUserAdmin}
					quoteMessage={this.props.quoteMessage}
					replyToMessage={this.props.replyToMessage}
					hideText={this.props.hideText}
					unhideText={this.props.unhideText}
					banUser={this.props.banUser}
					unbanUser={this.props.unbanUser}
					visible={this.state.actionSheetVisible}
					onRequestClose={this._handleRequestClose}
				/>
			</View>
		);
	}
}
