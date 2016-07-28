/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import DiscussionActionSheetContainer from '../../containers/DiscussionActionSheetContainer';
import DiscussionActions from '../../containers/DiscussionActionsContainer';
import DiscussionSummary from './DiscussionSummary';
import DiscussionAuthor from './DiscussionAuthor';
import CardTitle from '../Card/CardTitle';
import TouchFeedback from '../Core/TouchFeedback';
import Icon from '../Core/Icon';
import Colors from '../../../Colors';
import { TAG_POST_HIDDEN } from '../../../../lib/Constants';
import type { Thread, ThreadRel } from '../../../../lib/schemaTypes';

const {
	StyleSheet,
	TouchableOpacity,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	item: {
		marginHorizontal: 16,
	},

	row: {
		flexDirection: 'row',
		alignItems: 'center',
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

	badge: {
		position: 'absolute',
		top: 54,
		left: 5,
		height: 6,
		width: 6,
		borderRadius: 3,
		backgroundColor: Colors.accent,
		elevation: 1,
	},
});

type Props = {
	thread: Thread;
	threadrel: ?ThreadRel;
	user: string;
	onNavigate: Function;
}

type State = {
	actionSheetVisible: boolean
}

export default class DiscussionItemBase extends Component<void, Props, State> {
	static propTypes = {
		thread: PropTypes.shape({
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			body: PropTypes.string.isRequired,
			creator: PropTypes.string.isRequired,
			parents: PropTypes.arrayOf(PropTypes.string).isRequired,
		}).isRequired,
		threadrel: PropTypes.object,
		user: PropTypes.string.isRequired,
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

	_handlePress = () => {
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
			user,
			onNavigate,
		} = this.props;

		// FIXME: temporary check to avoid crash
		if (!(thread && thread.body && thread.name)) {
			return null;
		}

		const hidden = thread.tags && thread.tags.indexOf(TAG_POST_HIDDEN) > -1;
		const unread = threadrel && threadrel.presenceTime && thread.updateTime ? thread.updateTime > threadrel.presenceTime : false;

		return (
			<View {...this.props}>
				<TouchFeedback onPress={this._handlePress}>
					<View style={hidden ? styles.hidden : null}>
						<View style={styles.row}>
							<DiscussionAuthor {...this.props} style={styles.author} />
							<TouchableOpacity onPress={this._handleShowMenu}>
								<Icon
									name='expand-more'
									style={styles.expand}
									size={20}
								/>
							</TouchableOpacity>
						</View>
						{unread ?
							<View style={styles.badge} /> :
							null
						}
						<CardTitle style={styles.item}>
							{thread.name}
						</CardTitle>
						<DiscussionSummary
							text={thread.body}
							meta={thread.meta}
						/>
						<DiscussionActions
							thread={thread}
							threadrel={threadrel}
							user={user}
							onNavigate={onNavigate}
						/>
					</View>
				</TouchFeedback>

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
