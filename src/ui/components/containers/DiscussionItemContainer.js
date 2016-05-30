/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import DiscussionItem from '../views/Discussion/DiscussionItem';
import {
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
};

const mapActionsToProps = {
	hideThread: (store, result) => () => store.put(hideThread(result.thread)),
	unhideThread: (store, result) => () => store.put(unhideThread(result.thread)),
	banUser: (store, result) => () => store.put(banUser(result.thread.creator)),
	unbanUser: (store, result) => () => store.put(unbanUser(result.thread.creator)),
};

const DiscussionItemContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			...mapSubscriptionToProps,
			thread: {
				key: {
					type: 'entity',
					id: props.thread,
				},
			},
		}}
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={DiscussionItem}
	/>
);

DiscussionItemContainer.propTypes = {
	thread: PropTypes.string,
};

export default DiscussionItemContainer;
