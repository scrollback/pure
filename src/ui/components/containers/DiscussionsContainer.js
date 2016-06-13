/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createPaginatedContainer from '../../../modules/store/createPaginatedContainer';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import Discussions from '../views/Discussion/Discussions';
import {
	TYPE_THREAD,
	TAG_POST_HIDDEN,
	TAG_USER_ADMIN,
} from '../../../lib/Constants';
import type {
	Thread,
	ThreadRel,
	User,
} from '../../../lib/schemaTypes';

type ThreadData = Array<{ thread?: Thread; threadrel?: ThreadRel; type?: 'loading' | 'cta' }>

const CTA = { type: 'cta' };

export const transformThreads = (results: ThreadData, me: User): ThreadData => {
	const data = me && me.tags && me.tags.indexOf(TAG_USER_ADMIN) >= 0 ? results.reverse() : results.filter(({ type, thread }) => {
		if (thread && thread.type === TYPE_THREAD) {
			const isHidden = me.id !== thread.creator && thread.tags && thread.tags.indexOf(TAG_POST_HIDDEN) > -1;
			return !isHidden;
		}
		return type === 'loading';
	}).reverse();

	if (data.length > 3) {
		data.splice(3, 0, CTA);
	}

	return data;
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

function sliceFromProps(props) {
	return {
		type: 'thread',
		join: {
			threadrel: 'item',
		},
		filter: {
			thread: {
				parents_cts: [ props.room ],
			},
			threadrel: {
				user: props.user,
			},
		},
		order: 'createTime',
	};
}

export default flowRight(
	createUserContainer(),
	createPaginatedContainer(sliceFromProps, 10),
	createContainer(mapSubscriptionToProps),
	createTransformPropsContainer(transformFunction),
)(Discussions);
