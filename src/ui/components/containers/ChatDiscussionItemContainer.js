/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import ChatDiscussionItem from '../views/Chat/ChatDiscussionItem';

function mapSubscriptionToProps({ user, thread, room }) {
	return {
		thread: {
			key: {
				type: 'entity',
				id: thread,
			},
		},
		threadrel: {
			key: {
				type: 'entity',
				id: `${user}_${thread}`,
			},
		},
		room: {
			key: {
				type: 'entity',
				id: `${room}`,
			},
		},
	};
}

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps),
)(ChatDiscussionItem);
