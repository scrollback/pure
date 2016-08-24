/* @flow */

import createContainer from '../../../modules/store/createContainer';
import DiscussionActions from '../views/Discussion/DiscussionActions';
import { shareThread } from '../../../modules/store/actions';

const getThreadRoute = thread => ({
	name: 'chat',
	props: {
		room: thread.parents[0],
		thread: thread.id,
		title: thread.name,
	},
});

const mapDispatchToProps = dispatch => ({
	shareLink: (user, thread, roles) => {
		dispatch({
			type: 'SHARE_LINK',
			payload: {
				title: 'Share discussion',
				route: getThreadRoute(thread),
			},
		});
		dispatch(shareThread(thread.id, user, roles));
	},
});

export default createContainer(null, mapDispatchToProps)(DiscussionActions);
