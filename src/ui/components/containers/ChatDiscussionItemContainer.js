/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import ChatDiscussionItem from '../views/Chat/ChatDiscussionItem';

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
	shareOnFacebook: thread => {
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
	},
	shareOnTwitter: (thread, room) => {
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
	},
	shareOnWhatsApp: thread => {
		const text = 'Saw this on my Belong neighborhood group. You should check it out.';
		const route = getThreadRoute(thread);

		dispatch({
			type: 'SHARE_WHATSAPP',
			payload: {
				text,
				route,
			},
		});
	},
});

const mapSubscriptionToProps = ({ user, thread, room }) => {
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
};

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps, mapDispatchToProps),
)(ChatDiscussionItem);
