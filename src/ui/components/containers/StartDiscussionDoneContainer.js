/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import StartDiscussionDone from '../views/StartDiscussion/StartDiscussionDone';

function mapSubscriptionToProps({ thread }) {
	if (!thread) {
		return {};
	}

	return {
		thread: {
			key: {
				type: 'entity',
				id: thread,
			},
		},
	};
}

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps)
)(StartDiscussionDone);
