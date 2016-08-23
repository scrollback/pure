/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import ChatDiscussionItem from '../views/Chat/ChatDiscussionItem';
import { shareThread } from '../../../modules/store/actions';

const getThreadRoute = thread => {
	return {
		name: 'chat',
		props: {
			room: thread.parents[0],
			thread: thread.id,
			title: thread.name,
		},
	};
};

const mapDispatchToProps = dispatch => ({
	shareOnFacebook: (user, thread, roles) => {
		const route = getThreadRoute(thread);

		dispatch({
			type: 'SHARE_FACEBOOK',
			payload: {
				route,
				...(thread.meta && thread.meta.photo ? {
					image: thread.meta.photo.thumbnail_url,
				} : {
					text: thread.body,
				}),
			},
		});
		dispatch(shareThread(thread.id, user, roles));
	},
	shareOnTwitter: (user, thread, roles, room) => {
		const text = 'Saw this on my Belong neighborhood group. Worth checking out.';
		const hashtags = room && room.name && room.name.indexOf(' ') === -1 ? [ room.name ] : null;
		const route = getThreadRoute(thread);

		dispatch({
			type: 'SHARE_TWITTER',
			payload: {
				text,
				route,
				hashtags,
			},
		});
		dispatch(shareThread(thread.id, user, roles));
	},
	shareOnWhatsApp: (user, thread, roles) => {
		const text = 'Saw this on my Belong neighborhood group. You should check it out.';
		const route = getThreadRoute(thread);

		dispatch({
			type: 'SHARE_WHATSAPP',
			payload: {
				text,
				route,
			},
		});
		dispatch(shareThread(thread.id, user, roles));
	},
});

export default flowRight(
	createUserContainer(),
	createContainer(null, mapDispatchToProps),
)(ChatDiscussionItem);
