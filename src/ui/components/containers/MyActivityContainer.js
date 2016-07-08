/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createPaginatedContainer from '../../../modules/store/createPaginatedContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
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

function transformFunction(props) {
	if (props.data && props.me) {
		return {
			...props,
			data: transformThreads(props.data, props.me),
		};
	}
	return props;
}

function mapSubscriptionToProps(props) {
	return {
		me: {
			key: {
				type: 'entity',
				id: props.user,
			},
		},
	};
}

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
		order: 'updateTime',
	};
}

export default flowRight(
	createUserContainer(),
	createPaginatedContainer(sliceFromProps, 10),
	createContainer(mapSubscriptionToProps),
	createTransformPropsContainer(transformFunction),
)(MyActivity);
