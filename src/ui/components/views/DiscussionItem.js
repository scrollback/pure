/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import Colors from '../../Colors';
import Card from './Card';
import CardTitle from './CardTitle';
import DiscussionSummary from './DiscussionSummary';
import DiscussionFooter from './DiscussionFooter';
import TouchFeedback from './TouchFeedback';
import Modal from './Modal';
import Icon from './Icon';
import Share from '../../modules/Share';
import NavigationActions from '../../navigation-rfc/Navigation/NavigationActions';
import { convertRouteToURL } from '../../../lib/Route';
import { config } from '../../../core-client';
import { TAG_POST_HIDDEN } from '../../../lib/Constants';
import type { Thread } from '../../../lib/schemaTypes';

const {
	Clipboard,
	Linking,
	ToastAndroid,
	StyleSheet,
	TouchableOpacity,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	item: {
		marginHorizontal: 16,
	},
	footer: {
		marginVertical: 12,
	},
	topArea: {
		flexDirection: 'row',
	},
	title: {
		flex: 1,
		marginTop: 16,
	},
	badge: {
		margin: 12,
	},
	expand: {
		marginHorizontal: 16,
		marginVertical: 12,
		color: Colors.fadedBlack,
	},
	hidden: {
		opacity: 0.3,
	},
});

type Props = {
	thread: Thread;
	isUserAdmin: boolean;
	hideThread: Function;
	unhideThread: Function;
	banUser: Function;
	unbanUser: Function;
	onNavigation: Function;
}

export default class DiscussionItem extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			body: PropTypes.string.isRequired,
			creator: PropTypes.string.isRequired,
			parents: PropTypes.arrayOf(PropTypes.string).isRequired,
		}).isRequired,
		onNavigation: PropTypes.func.isRequired,
		isUserAdmin: PropTypes.bool,
		hideThread: PropTypes.func.isRequired,
		unhideThread: PropTypes.func.isRequired,
		banUser: PropTypes.func.isRequired,
		unbanUser: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	_copyToClipboard: Function = text => {
		Clipboard.setString(text);
		ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
	};

	_handleShowMenu: Function = () => {
		const { thread } = this.props;
		const menu = {};

		menu['Copy title'] = () => this._copyToClipboard(thread.name);

		const { meta } = thread;

		if (meta && meta.type === 'photo') {
			menu['Open image in browser'] = () => Linking.openURL(meta.url);
			menu['Copy image link'] = () => this._copyToClipboard(meta.url);
		} else {
			menu['Copy summary'] = () => this._copyToClipboard(thread.body);
		}

		menu['Share discussion'] = () => {
			Share.shareItem('Share discussion', config.server.protocol + '//' + config.server.host + convertRouteToURL({
				name: 'chat',
				props: {
					room: thread.parents[0],
					thread: thread.id,
					title: thread.name,
				},
			}));
		};

		if (this.props.isUserAdmin) {
			if (thread.tags && thread.tags.indexOf(TAG_POST_HIDDEN) > -1) {
				menu['Unhide discussion'] = () => this.props.unhideThread();
			} else {
				menu['Hide discussion'] = () => this.props.hideThread();
			}
		}

		Modal.showActionSheetWithItems(menu);
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
		} = this.props;

		const hidden = thread.tags && thread.tags.indexOf(TAG_POST_HIDDEN) > -1;

		return (
			<Card {...this.props}>
				<TouchFeedback onPress={this._handlePress}>
					<View style={hidden ? styles.hidden : null}>
						<View style={styles.topArea}>
							<CardTitle style={[ styles.item, styles.title ]}>
								{this.props.thread.name}
							</CardTitle>

							<TouchableOpacity onPress={this._handleShowMenu}>
								<Icon
									name='expand-more'
									style={styles.expand}
									size={20}
								/>
							</TouchableOpacity>
						</View>

						<DiscussionSummary text={thread.body} meta={thread.meta} />
						<DiscussionFooter style={[ styles.item, styles.footer ]} thread={thread} />
					</View>
				</TouchFeedback>
			</Card>
		);
	}
}
