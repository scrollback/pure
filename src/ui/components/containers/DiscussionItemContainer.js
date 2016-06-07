/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import DiscussionItem from '../views/Discussion/DiscussionItem';
import {
	likeThread,
	unlikeThread,
	hideThread,
	unhideThread,
	banUser,
	unbanUser,
} from '../../../modules/store/actions';
import { TAG_USER_ADMIN } from '../../../lib/Constants';

const hasAdminTag = user => (user && user.tags && user.tags.indexOf(TAG_USER_ADMIN) > -1);

const mapSubscriptionToProps = {
	isUserAdmin: {
		key: 'me',
		transform: hasAdminTag,
	},
	user: {
		key: {
			type: 'state',
			path: 'user',
		},
	},
};

const mapActionsToProps = {
	likeThread: (store, result, props) => () => {
		store.put(
			likeThread(props.thread.id, result.user, props.threadrel && props.threadrel.roles ? props.threadrel.roles : [])
		);
	},
	unlikeThread: (store, result, props) => () => {
		store.put(
			unlikeThread(props.thread.id, result.user, props.threadrel && props.threadrel.roles ? props.threadrel.roles : [])
		);
	},
	hideThread: (store, result, props) => () => store.put(hideThread(props.thread)),
	unhideThread: (store, result, props) => () => store.put(unhideThread(props.thread)),
	banUser: (store, result, props) => () => store.put(banUser(props.thread.creator)),
	unbanUser: (store, result, props) => () => store.put(unbanUser(props.thread.creator)),
};

const DiscussionItemContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={DiscussionItem}
	/>
);

DiscussionItemContainer.propTypes = {
	thread: PropTypes.object,
};

export default DiscussionItemContainer;
