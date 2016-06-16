/* @flow */

import flowRight from 'lodash/flowRight';
import createPaginatedContainer from '../../../modules/store/createPaginatedContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import MyActivity from '../views/Homescreen/MyActivity';
import {
	TYPE_THREAD,
	TAG_POST_HIDDEN,
	TAG_USER_ADMIN,
	ROLE_FOLLOWER,
	ROLE_MENTIONED,
	ROLE_UPVOTE,
} from '../../../lib/Constants';
import type {
	Thread,
	ThreadRel,
	User,
} from '../../../lib/schemaTypes';

type ThreadData = Array<{ thread?: Thread; threadrel?: ThreadRel; type?: 'loading' }>

export const transformThreads = (results: ThreadData, me: User): ThreadData => {
	return me && me.tags && me.tags.indexOf(TAG_USER_ADMIN) >= 0 ? results.reverse() : results.filter(({ type, thread }) => {
		if (thread && thread.type === TYPE_THREAD) {
			const isHidden = me.id !== thread.creator && thread.tags && thread.tags.indexOf(TAG_POST_HIDDEN) > -1;
			return !isHidden;
		}
		return type === 'loading';
	}).reverse();
};

function sliceFromProps({ user }) {
	return {
		type: 'threadrel',
		link: {
			thread: 'item',
		},
		filter: {
			threadrel: {
				user,
				roles_olp: [ ROLE_FOLLOWER, ROLE_MENTIONED, ROLE_UPVOTE ],
			},
		},
		order: 'createTime',
	};
}

export default flowRight(
	createUserContainer(),
	createPaginatedContainer(sliceFromProps, 10),
)(MyActivity);
