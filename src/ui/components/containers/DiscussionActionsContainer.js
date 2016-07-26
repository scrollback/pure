/* @flow */

import createContainer from '../../../modules/store/createContainer';
import DiscussionActions from '../views/Discussion/DiscussionActions';

const getThreadRoute = thread => ({
	name: 'chat',
	props: {
		room: thread.parents[0],
		thread: thread.id,
		title: thread.name,
	},
});

const mapDispatchToProps = dispatch => ({
	shareLink: thread => {
		dispatch({
			type: 'SHARE_LINK',
			payload: {
				title: 'Share discussion',
				route: getThreadRoute(thread),
			},
		});
	},
});

export default createContainer(null, mapDispatchToProps)(DiscussionActions);
