/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import PassUserProp from '../../../modules/store/PassUserProp';
import Chat from '../views/Chat';
import { sendMessage } from '../../../modules/store/actions';

const mapActionsToProps = {
	sendMessage: (store, result, props) => (id, body, meta) => store.dispatch(sendMessage({
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

export default PassUserProp(ChatContainer);
