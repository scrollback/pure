/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import Card from '../Card/Card';
import CardTitle from '../Card/CardTitle';
import DiscussionSummary from './DiscussionSummary';
import DiscussionAuthor from './DiscussionAuthor';
import DiscussionActions from './DiscussionActions';
import TouchFeedback from '../Core/TouchFeedback';
import Icon from '../Core/Icon';
import ActionSheet from '../Core/ActionSheet';
import ActionSheetItem from '../Core/ActionSheetItem';
import NavigationActions from '../../../navigation-rfc/Navigation/NavigationActions';
import Colors from '../../../Colors';
import { convertRouteToURL } from '../../../../lib/Route';
import { config } from '../../../../core-client';
import { TAG_POST_HIDDEN } from '../../../../lib/Constants';
import type { Thread, ThreadRel } from '../../../../lib/schemaTypes';

const {
	Clipboard,
	Linking,
	ToastAndroid,
	StyleSheet,
	TouchableOpacity,
	PixelRatio,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	item: {
		marginHorizontal: 16,
	},

	separator: {
		borderTopWidth: 1 / PixelRatio.get(),
		borderTopColor: Colors.separator,
	},

	topArea: {
		flexDirection: 'row',
	},

	author: {
		flex: 1,
		marginHorizontal: 16,
	},

	expand: {
		marginHorizontal: 16,
		marginVertical: 12,
		color: Colors.grey,
	},

	hidden: {
		opacity: 0.3,
	},
});

type Props = {
	thread: Thread;
	threadrel: ThreadRel;
	isUserAdmin: boolean;
	hideThread: Function;
	unhideThread: Function;
	likeThread: Function;
	unlikeThread: Function;
	banUser: Function;
	unbanUser: Function;
	onNavigation: Function;
}

type State = {
	actionSheetVisible: boolean
}

export default class DiscussionItem extends Component<void, Props, State> {
	static propTypes = {
		thread: PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			body: PropTypes.string.isRequired,
			creator: PropTypes.string.isRequired,
			parents: PropTypes.arrayOf(PropTypes.string).isRequired,
		}).isRequired,
		threadrel: PropTypes.object.isRequired,
		onNavigation: PropTypes.func.isRequired,
		isUserAdmin: PropTypes.bool,
		hideThread: PropTypes.func.isRequired,
		unhideThread: PropTypes.func.isRequired,
		likeThread: PropTypes.func.isRequired,
		unlikeThread: PropTypes.func.isRequired,
		banUser: PropTypes.func.isRequired,
		unbanUser: PropTypes.func.isRequired,
	};

	state: State = {
		actionSheetVisible: false,
	};

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_copyToClipboard: Function = text => {
		Clipboard.setString(text);
		ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
	};

	_handleOpenImage: Function = () => {
		const { thread } = this.props;

		if (thread.meta) {
			const { photo } = thread.meta;

			Linking.openURL(photo.url);
		}
	};

	_handleCopyImageLink: Function = () => {
		const { thread } = this.props;

		if (thread.meta) {
			const { photo } = thread.meta;

			this._copyToClipboard(photo.url);
		}
	};

	_handleCopyTitle: Function = () => {
		this._copyToClipboard(this.props.thread.name);
	};

	_handleCopySummary: Function = () => {
		this._copyToClipboard(this.props.thread.body);
	};

	_handleCopyLink: Function = () => {
		const { thread } = this.props;

		this._copyToClipboard(config.server.protocol + '//' + config.server.host + convertRouteToURL({
			name: 'chat',
			props: {
				room: thread.parents[0],
				thread: thread.id,
				title: thread.name,
			},
		}));
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

	_handlePress: Function = () => {
		const { thread } = this.props;

		this.props.onNavigation(new NavigationActions.Push({
			name: 'chat',
			props: {
				thread: thread.id,
				room: thread.parents[0],
			},
		}));
	};

	render() {
		const {
			thread,
			threadrel,
			isUserAdmin,
			onNavigation,
		} = this.props;

		// FIXME: temporary check to avoid crash
		if (!(thread && thread.body && thread.name)) {
			return null;
		}

		const hidden = thread.tags && thread.tags.indexOf(TAG_POST_HIDDEN) > -1;

		return (
			<Card {...this.props}>
				<TouchFeedback onPress={this._handlePress}>
					<View style={hidden ? styles.hidden : null}>
						<View style={styles.topArea}>
							<DiscussionAuthor {...this.props} style={styles.author} />
							<TouchableOpacity onPress={this._handleShowMenu}>
								<Icon
									name='expand-more'
									style={styles.expand}
									size={20}
								/>
							</TouchableOpacity>
						</View>
						<CardTitle style={styles.item}>
							{thread.name}
						</CardTitle>
						<DiscussionSummary
							text={thread.body}
							meta={thread.meta}
						/>
						<View style={styles.separator} />
						<DiscussionActions
							thread={thread}
							threadrel={threadrel}
							likeThread={this.props.likeThread}
							unlikeThread={this.props.unlikeThread}
							onNavigation={onNavigation}
						/>
					</View>
				</TouchFeedback>

				<ActionSheet visible={this.state.actionSheetVisible} onRequestClose={this._handleRequestClose}>
					<ActionSheetItem onPress={this._handleCopyTitle}>
						Copy title
					</ActionSheetItem>

					{thread.meta && thread.meta.photo ? [
						<ActionSheetItem key='open-image' onPress={this._handleOpenImage}>
							Open image in browser
						</ActionSheetItem>,
						<ActionSheetItem key='copy-imagelink' onPress={this._handleCopyImageLink}>
							Copy image link
						</ActionSheetItem>,
					] :
						<ActionSheetItem onPress={this._handleCopySummary}>
							Copy summary
						</ActionSheetItem>
					}

					<ActionSheetItem onPress={this._handleCopyLink}>
						Copy discussion link
					</ActionSheetItem>

					{isUserAdmin ?
						hidden ?
							<ActionSheetItem onPress={this.props.unhideThread}>
								Unhide discussion
							</ActionSheetItem> :
							<ActionSheetItem onPress={this.props.hideThread}>
								Hide discussion
							</ActionSheetItem> : null
					}
				</ActionSheet>
			</Card>
		);
	}
}
