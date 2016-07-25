/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { ShareDialog } from 'react-native-fbsdk';
import AppText from '../Core/AppText';
import ChatBubble from './ChatBubble';
import ChatTimestamp from './ChatTimestamp';
import ChatAvatar from './ChatAvatar';
import ChatText from './ChatText';
import DiscussionActionLikeContainer from '../../containers/DiscussionActionLikeContainer';
import DiscussionActionSheetContainer from '../../containers/DiscussionActionSheetContainer';
import { TAG_POST_HIDDEN } from '../../../../lib/Constants';
import type { Room, Thread, ThreadRel } from '../../../../lib/schemaTypes';
import Colors from '../../../Colors';
import { config } from '../../../../core-client';
import { convertRouteToURL } from '../../../../lib/Route';

const {
	StyleSheet,
	TouchableOpacity,
	View,
	Image,
	Linking,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		marginVertical: 4,
	},
	chat: {
		flexDirection: 'column',
		alignItems: 'flex-start',
		marginLeft: 44,
		marginRight: 4,
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
		marginTop: 12,
		marginBottom: -8,
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
		minWidth: 300,
	},
	sharebuttons: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
		marginHorizontal: 8,
	},
	label: {
		color: Colors.grey,
		fontWeight: 'bold',
		fontSize: 11,
		marginHorizontal: 4,
	},
	icon: {
		color: Colors.grey,
		margin: 4,
	},
	image: {
		margin: 4,
	},
});

type Props = {
	room: Room;
	thread: Thread;
	threadrel: ?ThreadRel;
	showTimestamp?: boolean;
	user: string;
	style?: any;
	onNavigate: Function;
};

type State = {
	canShareToWhatsApp: boolean;
	actionSheetVisible: boolean;
}

export default class ChatDiscussionItem extends Component<void, Props, State> {
	static propTypes = {
		room: PropTypes.shape({
			name: PropTypes.string.isRequired
		}).isRequired,
		thread: PropTypes.shape({
			body: PropTypes.string.isRequired,
			creator: PropTypes.string.isRequired,
			createTime: PropTypes.number.isRequired,
			meta: PropTypes.object,
		}).isRequired,
		threadrel: PropTypes.object,
		showTimestamp: PropTypes.bool,
		user: PropTypes.string.isRequired,
		style: View.propTypes.style,
		onNavigate: PropTypes.func.isRequired,
	};

	state: State = {
		canShareToWhatsApp: false,
		actionSheetVisible: false,
	};

	componentDidMount() {
		this._checkWhatsApp();
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_checkWhatsApp = async () => {
		const canShareToWhatsApp = await Linking.canOpenURL('whatsapp://send?text=test');

		if (canShareToWhatsApp) {
			this.setState({ canShareToWhatsApp });
		}
	}

	_getURL = () => {
		const { thread } = this.props;

		return config.server.protocol + '//' + config.server.host + convertRouteToURL({
			name: 'chat',
			props: {
				room: thread.parents[0],
				thread: thread.id,
				title: thread.name,
			},
		});
	}

	_handleFacebookPress = async () => {
		const { thread } = this.props;
		const contentUrl = this._getURL();
		const shareLinkContent = {
			contentType: 'link',
			contentUrl,
			...(thread.meta && thread.meta.photo ? {
				imageURL: thread.meta.photo.thumbnail_url,
			} : {
				contentDescription: thread.body,
			}),
		};

		const canShow = await ShareDialog.canShow(shareLinkContent);

		if (canShow) {
			await ShareDialog.show(shareLinkContent);
		} else {
			Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(contentUrl)}`);
		}
	}

	_handleTwitterPress = () => {
		const { room } = this.props;
		const hashtags = room && room.name && room.name.indexOf(' ') === -1 ? room.name : '';
		const contentUrl = this._getURL();
		const shareText = 'Saw this on my Belong neighborhood group. Worth checking out.';

		Linking.openURL(`http://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(contentUrl)}&hashtags=${encodeURIComponent(hashtags)}&via=belongchat`);
	}

	_handleWhatsAppPress = () => {
		const contentUrl = this._getURL();
		const shareText = `Saw this on my Belong neighborhood group. You should check it out.\n${contentUrl}`;

		Linking.openURL(`whatsapp://send?text=${encodeURIComponent(shareText)}`);
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
				<View style={[ styles.chat, hidden ? styles.hidden : null ]}>
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
								<ChatText body={thread.body} meta={thread.meta} />

								<View style={styles.separator} />

								<View style={styles.footer}>
									<DiscussionActionLikeContainer
										thread={thread}
										threadrel={threadrel}
										user={user}
									/>
									<View style={styles.sharebuttons}>
										<AppText style={styles.label}>Share</AppText>
										<TouchableOpacity onPress={this._handleFacebookPress}>
											<EvilIcons
												name='sc-facebook'
												style={styles.icon}
												size={28}
											/>
										</TouchableOpacity>
										<TouchableOpacity onPress={this._handleTwitterPress}>
											<EvilIcons
												name='sc-twitter'
												style={styles.icon}
												size={28}
											/>
										</TouchableOpacity>
										{this.state.canShareToWhatsApp ?
											<TouchableOpacity onPress={this._handleWhatsAppPress}>
												<Image source={require('../../../../../assets/whatsapp-icon.png')} style={styles.image} />
											</TouchableOpacity> :
											null
										}
									</View>
								</View>
							</ChatBubble>
						</TouchableOpacity>
					</View>
				</View>

				{showTimestamp ?
					<ChatTimestamp style={styles.timestampLeft} time={thread.createTime} /> :
					null
				}

				<DiscussionActionSheetContainer
					thread={thread}
					threadrel={threadrel}
					visible={this.state.actionSheetVisible}
					onRequestClose={this._handleRequestClose}
				/>
			</View>
		);
	}
}
