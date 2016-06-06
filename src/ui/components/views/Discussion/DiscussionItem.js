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
import DiscussionActionSheet from './DiscussionActionSheet';
import Colors from '../../../Colors';
import { TAG_POST_HIDDEN } from '../../../../lib/Constants';
import type { Thread, ThreadRel } from '../../../../lib/schemaTypes';

const {
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
	onNavigate: Function;
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
		onNavigate: PropTypes.func.isRequired,
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

	render() {
		const {
			thread,
			threadrel,
			isUserAdmin,
			onNavigate,
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
							onNavigate={onNavigate}
						/>
					</View>
				</TouchFeedback>

				<DiscussionActionSheet
					thread={thread}
					threadrel={threadrel}
					isUserAdmin={isUserAdmin}
					hideThread={this.props.hideThread}
					unhideThread={this.props.unhideThread}
					banUser={this.props.banUser}
					unbanUser={this.props.unbanUser}
					visible={this.state.actionSheetVisible}
					onRequestClose={this._handleRequestClose}
				/>
			</Card>
		);
	}
}
