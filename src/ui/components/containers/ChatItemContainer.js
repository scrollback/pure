/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import ChatItem from '../views/Chat/ChatItem';
import {
	likeText,
	unlikeText,
	hideText,
	unhideText,
	likeThread,
	unlikeThread,
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
	user: {
		key: {
			type: 'state',
			path: 'user',
		},
	},
};

const mapActionsToProps = {
	likeText: (store, result, props) => () => {
		if (props.text.type === TYPE_THREAD) {
			store.put(
				likeThread(props.text.id, result.user, props.textrel && props.textrel.roles ? props.textrel.roles : [])
			);
		} else {
			store.put(
				likeText(props.text.id, result.user, props.textrel && props.textrel.roles ? props.textrel.roles : [])
			);
		}
	},
	unlikeText: (store, result, props) => () => {
		if (props.text.type === TYPE_THREAD) {
			store.put(
				unlikeThread(props.text.id, result.user, props.textrel && props.textrel.roles ? props.textrel.roles : [])
			);
		} else {
			store.put(
				unlikeText(props.text.id, result.user, props.textrel && props.textrel.roles ? props.textrel.roles : [])
			);
		}
	},
	hideText: (store, result, props) => () => {
		if (props.text.type === TYPE_THREAD) {
			store.put(hideThread(props.text));
		} else {
			store.put(hideText(props.text));
		}
	},
	unhideText: (store, result, props) => () => {
		if (props.text.type === TYPE_THREAD) {
			store.put(unhideThread(props.text));
		} else {
			store.put(unhideText(props.text));
		}
	},
	banUser: (store, result, props) => () => store.put(banUser(props.text.creator)),
	unbanUser: (store, result, props) => () => store.put(unbanUser(props.text.creator)),
};

const ChatItemContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={mapSubscriptionToProps}
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={ChatItem}
	/>
);

ChatItemContainer.propTypes = {
	text: PropTypes.object.isRequired,
};

export default ChatItemContainer;
