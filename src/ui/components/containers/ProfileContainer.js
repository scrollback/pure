/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
import Profile from '../views/Profile/Profile';
import { bus } from '../../../core-client';
import {
	ROLE_FOLLOWER,
	ROLE_HOME,
	ROLE_WORK,
	ROLE_HOMETOWN,
	TAG_ROOM_AREA,
	TAG_ROOM_CITY,
} from '../../../lib/Constants';

const ITEM_LOADING = { type: 'loading' };

const roomRelsToPlaces = data => data.map(result => {
	const {
		room,
		roomrel,
	} = result;

	if (room && roomrel) {
		if (typeof room.type === 'string' || typeof roomrel.type === 'string') {
			return ITEM_LOADING;
		}

		return {
			name: room.name,
			types: roomrel.roles,
		};
	}

	return ITEM_LOADING;
});

const normalizePlaces = results => {
	if (results.indexOf(ITEM_LOADING) > -1) {
		return [];
	}

	const map = {};

	for (let i = 0, l = results.length; i < l; i++) {
		const item = results[i];

		map[item.name] = item;
	}

	const roles = {
		[ROLE_HOME]: [],
		[ROLE_WORK]: [],
		[ROLE_HOMETOWN]: [],
	};

	for (const item in map) {
		const { types, name } = map[item];

		if (types.indexOf(ROLE_HOME) > -1) {
			roles[ROLE_HOME].push(name);
		} else if (types.indexOf(ROLE_WORK) > -1) {
			roles[ROLE_WORK].push(name);
		} else if (types.indexOf[ROLE_HOMETOWN] > -1) {
			roles[ROLE_HOMETOWN].push(name);
		}
	}

	return roles;
};

const transformFunction = props => {
	if (props.areas && props.cities) {
		return {
			...props,
			places: normalizePlaces([
				...roomRelsToPlaces(props.areas),
				...roomRelsToPlaces(props.cities),
			]),
		};
	}
	return props;
};

const mapDispatchToProps = () => ({
	signOut: () => bus.emit('signout'),
});

const mapSubscriptionToProps = ({ user }) => ({
	currentUser: {
		key: {
			type: 'state',
			path: 'user',
		},
	},
	user: {
		key: {
			type: 'entity',
			id: user,
		},
	},
	areas: {
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
					room: {
						tags_cts: [ TAG_ROOM_AREA ],
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
	cities: {
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
					room: {
						tags_cts: [ TAG_ROOM_CITY ],
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
});

export default flowRight(
	createContainer(mapSubscriptionToProps, mapDispatchToProps),
	createTransformPropsContainer(transformFunction),
)(Profile);
