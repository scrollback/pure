/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import DiscussionActionItem from './DiscussionActionItem';
import Colors from '../../../Colors';
import { ROLE_UPVOTE } from '../../../../lib/Constants';
import type { Thread, ThreadRel } from '../../../../lib/schemaTypes';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	liked: {
		color: Colors.accent,
	},
});

type Props = {
	thread: Thread;
	threadrel: ?ThreadRel;
	unlikeThread: Function;
	likeThread: Function;
	user: string;
	style?: any;
}

type State = {
	likes: number;
}

export default class DiscussionActionLike extends Component<void, Props, State> {
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
		unlikeThread: PropTypes.func.isRequired,
		likeThread: PropTypes.func.isRequired,
		user: PropTypes.string.isRequired,
		style: View.propTypes.style,
	};

	state: State = {
		likes: 0,
	};

	componentDidMount() {
		this._updateLikeCount(this.props.thread);
	}

	componentWillReceiveProps(nextProps: Props) {
		if (this._compareLikeCount(this.props.thread, nextProps.thread)) {
			this._updateLikeCount(nextProps.thread);
		}
	}

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_compareLikeCount = (currentThread: Thread, nextThread: Thread) => {
		const currentCount = currentThread.counts && currentThread.counts.upvote ? currentThread.counts.upvote : 0;
		const nextCount = nextThread.counts && nextThread.counts.upvote ? nextThread.counts.upvote : 0;

		return currentCount !== nextCount;
	}

	_updateLikeCount = (thread: Thread) => {
		const likes = thread.counts && thread.counts.upvote ? thread.counts.upvote : 0;

		if (likes >= 0) {
			this.setState({
				likes,
			});
		}
	};

	_isLiked = () => {
		const {
			threadrel,
		} = this.props;

		return threadrel && threadrel.roles ? threadrel.roles.indexOf(ROLE_UPVOTE) > -1 : false;
	};

	_handleLike = () => {
		const { thread, threadrel, user } = this.props;
		const roles = threadrel ? threadrel.roles : [];

		let { likes } = this.state;

		if (this._isLiked()) {
			likes--;
			this.props.unlikeThread(thread.id, user, roles);
		} else {
			likes++;
			this.props.likeThread(thread.id, user, roles);
		}

		if (likes >= 0) {
			this.setState({
				likes,
			});
		}
	};

	render() {
		const liked = this._isLiked();

		let likeCount;

		if (this.state.likes) {
			likeCount = this.state.likes;
		} else if (liked) {
			likeCount = 1;
		} else {
			likeCount = 0;
		}

		return (
			<DiscussionActionItem
				label={`Like ${likeCount ? '(' + likeCount + ')' : ''}`}
				icon={liked ? 'favorite' : 'favorite-border'}
				onPress={this._handleLike}
				iconStyle={liked ? styles.liked : null}
				labelStyle={liked ? styles.liked : null}
			/>
		);
	}
}
