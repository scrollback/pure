/* @flow */

import createContainer from '../../../modules/store/createContainer';
import DiscussionDetails from '../views/Discussion/DiscussionDetails';

const mapSubscriptionToProps = ({ thread }) => ({
	thread: {
		key: {
			type: 'entity',
			id: thread,
		},
	},
});

export default createContainer(mapSubscriptionToProps)(DiscussionDetails);
