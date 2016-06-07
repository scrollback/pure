/* @flow */

import flowRight from 'lodash/flowRight';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import RoomList from '../views/Homescreen/RoomList';
import { ROLE_FOLLOWER } from '../../../lib/Constants';

const ITEM_LOADING = { type: 'loading' };

const filterInvalidRels = data => data.map(result => {
	if (!result.room || typeof result.room.type === 'string') {
		return ITEM_LOADING;
	}

	if (!result.roomrel || typeof result.roomrel.type === 'string') {
		return ITEM_LOADING;
	}

	return result;
});

const sortPlacesByTag = data => data.slice().sort((a, b) => {
	if (a.room && a.room.tags && b.room && b.room.tags) {
		const aTag = a.room.tags[0];
		const bTag = b.room.tags[0];

		if (aTag === bTag) {
			return 0;
		}

		if (aTag > bTag) {
			return -1;
		}

		if (aTag < bTag) {
			return 1;
		}
	}

	return -1;
});

function transformFunction(props) {
	if (props.data) {
		return {
			...props,
			data: sortPlacesByTag(filterInvalidRels(props.data)),
		};
	}
	return props;
}

function mapSubscriptionToProps({ user }) {
	return {
		data: {
			key: {
				slice: {
					type: 'roomrel',
					link: {
						room: 'item',
					},
					filter: {
						roomrel: {
							user,
							roles_cts: [ ROLE_FOLLOWER ],
						},
					},
					order: 'createTime',
				},
				range: {
					start: -Infinity,
					end: Infinity,
				},
			},
		},
	};
}

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps),
	createTransformPropsContainer(transformFunction),
)(RoomList);
