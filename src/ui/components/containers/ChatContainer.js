/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import createUserContainer from '../../../modules/store/createUserContainer';
import Chat from '../views/Chat/Chat';
import { sendMessage } from '../../../modules/store/actions';

const mapActionsToProps = {
	sendMessage: (store, result, props) => (id, body, meta) => store.put(sendMessage({
		body,
		meta,
		parents: [ props.thread, props.room ],
		creator: props.user,
	})),
};

const transformThreadToParents = thread => thread && thread.parents ? thread.parents : [];

const ChatContainer = (props: any) => (
	<Connect
		mapSubscriptionToProps={{
			parents: {
				key: {
					type: 'entity',
					id: props.thread,
				},
				transform: transformThreadToParents,
			},
		}}
		mapActionsToProps={mapActionsToProps}
		passProps={props}
		component={Chat}
	/>
);

ChatContainer.propTypes = {
	room: PropTypes.string.isRequired,
	thread: PropTypes.string.isRequired,
};

export default createUserContainer()(ChatContainer);
