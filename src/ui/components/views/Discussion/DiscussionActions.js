/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import DiscussionActionItem from './DiscussionActionItem';
import NavigationActions from '../../../navigation-rfc/Navigation/NavigationActions';
import Share from '../../../modules/Share';
import Colors from '../../../Colors';
import { ROLE_UPVOTE } from '../../../../lib/Constants';
import { config } from '../../../../core-client';
import { convertRouteToURL } from '../../../../lib/Route';
import type { Thread, ThreadRel } from '../../../../lib/schemaTypes';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	actions: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},

	liked: {
		color: Colors.accent,
	},
});

type Props = {
	thread: Thread;
	threadrel: ThreadRel;
	unlikeThread: Function;
	likeThread: Function;
	onNavigation: Function;
	style?: any;
}

export default class DiscussionActions extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.shape({
			updateTime: PropTypes.number.isRequired,
			creator: PropTypes.string.isRequired,
			counts: PropTypes.shape({
				children: PropTypes.number,
			}),
		}).isRequired,
		threadrel: PropTypes.shape({
			roles: PropTypes.arrayOf(PropTypes.number),
		}).isRequired,
		style: View.propTypes.style,
		unlikeThread: PropTypes.func.isRequired,
		likeThread: PropTypes.func.isRequired,
		onNavigation: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_isLiked: Function = () => {
		const {
			threadrel,
		} = this.props;

		return threadrel && threadrel.roles ? threadrel.roles.indexOf(ROLE_UPVOTE) > -1 : false;
	};

	_handleLike: Function = () => {
		if (this._isLiked()) {
			this.props.unlikeThread();
		} else {
			this.props.likeThread();
		}
	};

	_handleReply: Function = () => {
		const { thread } = this.props;

		this.props.onNavigation(new NavigationActions.Push({
			name: 'chat',
			props: {
				thread: thread.id,
				room: thread.parents[0],
			},
		}));
	};

	_handleShare: Function = () => {
		const { thread } = this.props;

		Share.shareItem('Share discussion', config.server.protocol + '//' + config.server.host + convertRouteToURL({
			name: 'chat',
			props: {
				room: thread.parents[0],
				thread: thread.id,
				title: thread.name,
			},
		}));
	};

	render() {
		const {
			thread,
		} = this.props;

		const liked = this._isLiked();

		return (
			<View {...this.props} style={[ styles.actions, this.props.style ]}>
				<DiscussionActionItem
					label={`Like ${thread.counts && thread.counts.upvote ? '(' + thread.counts.upvote + ')' : ''}`}
					icon={liked ? 'favorite' : 'favorite-border'}
					onPress={this._handleLike}
					iconStyle={liked ? styles.liked : null}
					labelStyle={liked ? styles.liked : null}
				/>
				<DiscussionActionItem
					label={`Reply ${thread.counts && thread.counts.children ? '(' + thread.counts.children + ')' : ''}`}
					icon='reply'
					onPress={this._handleReply}
				/>
				<DiscussionActionItem
					label='Share'
					icon='share'
					onPress={this._handleShare}
				/>
			</View>
		);
	}
}
