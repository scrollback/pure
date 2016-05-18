/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import ChatItem from '../views/ChatItem';
import {
	hideText,
	unhideText,
	hideThread,
	unhideThread,
	banUser,
	unbanUser,
} from '../../../modules/store/actions';
import { TAG_USER_ADMIN, TYPE_THREAD } from '../../../lib/Constants';

const hasAdminTag = user => (user && user.tags && user.tags.indexOf(TAG_USER_ADMIN) > -1);

const mapSubscriptionToProps = {
	isUserAdmin: {
		key: 'me',
		transform: hasAdminTag,
	},
};

const mapActionsToProps = {
	hideText: (store, result) => () => {
		if (result.text.type === TYPE_THREAD) {
			store.put(hideThread(result.text));
		} else {
			store.put(hideText(result.text));
		}
	},
	unhideText: (store, result) => () => {
		if (result.text.type === TYPE_THREAD) {
			store.put(unhideThread(result.text));
		} else {
			store.put(unhideText(result.text));
		}
	},
	banUser: (store, result) => () => store.put(banUser(result.text.creator)),
	unbanUser: (store, result) => () => store.put(unbanUser(result.text.creator)),
};

const ChatItemContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			...mapSubscriptionToProps,
			text: {
				key: {
					type: 'entity',
					id: props.text,
				},
			},
		}}
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={ChatItem}
	/>
);

ChatItemContainer.propTypes = {
	text: PropTypes.string,
};

export default ChatItemContainer;
