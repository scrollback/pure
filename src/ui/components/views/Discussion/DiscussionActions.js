/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import DiscussionActionLikeContainer from '../../containers/DiscussionActionLikeContainer';
import DiscussionActionItem from './DiscussionActionItem';
import Share from '../../../modules/Share';
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
		marginHorizontal: 8,
	},
});

type Props = {
	thread: Thread;
	threadrel: ?ThreadRel;
	user: string;
	onNavigate: Function;
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
		}),
		user: PropTypes.string.isRequired,
		onNavigate: PropTypes.func.isRequired,
		style: View.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleReply = () => {
		const { thread } = this.props;

		this.props.onNavigate({
			type: 'push',
			payload: {
				name: 'chat',
				props: {
					thread: thread.id,
					room: thread.parents[0],
				},
			},
		});
	};

	_handleShare = () => {
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
			threadrel,
		} = this.props;

		return (
			<View {...this.props} style={[ styles.actions, this.props.style ]}>
				<DiscussionActionLikeContainer
					thread={thread}
					threadrel={threadrel}
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
