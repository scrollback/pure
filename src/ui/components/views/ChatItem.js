/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import AvatarRound from './AvatarRound';
import ChatBubble from './ChatBubble';
import Embed from './Embed';
import Modal from './Modal';
import Icon from './Icon';
import Time from './Time';
import { parseURLs } from '../../../lib/URL';
import NavigationActions from '../../navigation-rfc/Navigation/NavigationActions';
import { TAG_POST_HIDDEN } from '../../../lib/Constants';
import type { Text } from '../../../lib/schemaTypes';

const {
	Clipboard,
	Linking,
	ToastAndroid,
	PixelRatio,
	StyleSheet,
	TouchableOpacity,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		marginHorizontal: 8,
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
		color: Colors.black,
		marginVertical: 2,
		opacity: 0.3,
	},
	timestampText: {
		color: Colors.black,
		fontSize: 12,
		lineHeight: 18,
		marginHorizontal: 6,
		paddingHorizontal: 8,
		opacity: 0.3,
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
	bubbleReceived: {
		marginRight: 8,
	},
	bubbleSent: {
		marginLeft: 8,
	},
	hidden: {
		opacity: 0.3,
	},
});

type Props = {
	text: Text;
	previousText: Text;
	isFirst: boolean;
	isLast: boolean;
	user: string;
	quoteMessage: Function;
	replyToMessage: Function;
	isUserAdmin: boolean;
	hideText: Function;
	unhideText: Function;
	banUser: Function;
	unbanUser: Function;
	style?: any;
	onNavigation: Function;
};

export default class ChatItem extends Component<void, Props, void> {
	static propTypes = {
		text: PropTypes.shape({
			body: PropTypes.string.isRequired,
			creator: PropTypes.string.isRequired,
			createTime: PropTypes.number.isRequired,
			meta: PropTypes.object,
		}).isRequired,
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
		banUser: PropTypes.func.isRequired,
		unbanUser: PropTypes.func.isRequired,
		style: View.propTypes.style,
		onNavigation: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	_goToProfile: Function = () => {
		const { text } = this.props;

		this.props.onNavigation(new NavigationActions.Push({
			name: 'profile',
			props: {
				user: text.creator,
			},
		}));
	};

	_copyToClipboard: Function = text => {
		Clipboard.setString(text);
		ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
	};

	_handleShowMenu: Function = () => {
		const { text, user } = this.props;

		const menu = {};

		if (text.meta && text.meta.photo) {
			const { photo } = text.meta;

			menu['Open image in browser'] = () => Linking.openURL(photo.url);
			menu['Copy image link'] = () => this._copyToClipboard(photo.url);
		} else {
			menu['Copy text'] = () => this._copyToClipboard(text.body);
			menu['Quote message'] = () => this.props.quoteMessage(text);
		}

		if (user !== text.creator) {
			menu['Reply to @' + text.creator] = () => this.props.replyToMessage(text);
		}

		if (this.props.isUserAdmin) {
			if (text.tags && text.tags.indexOf(TAG_POST_HIDDEN) > -1) {
				menu['Unhide message'] = () => this.props.unhideText();
			} else {
				menu['Hide message'] = () => this.props.hideText();
			}
		}

		Modal.showActionSheetWithItems(menu);
	};

	render() {
		const {
			text,
			previousText,
			isLast,
			user,
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

					<TouchableOpacity activeOpacity={0.5} onPress={this._handleShowMenu}>
						<ChatBubble
							body={text.meta && text.meta.photo ? null : text.body}
							creator={text.creator}
							type={received ? 'left' : 'right'}
							showAuthor={showAuthor}
							showArrow={received ? showAuthor : true}
							style={received ? styles.bubbleReceived : styles.bubbleSent}
						>
							{cover}
						</ChatBubble>
					</TouchableOpacity>
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
			</View>
		);
	}
}
