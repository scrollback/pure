/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import PassUserProp from '../../../modules/store/PassUserProp';
import Rooms from '../views/Rooms';
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

const transformResults = data => sortPlacesByTag(filterInvalidRels(data));

class RoomsContainer extends Component {
	static propTypes = {
		user: PropTypes.string.isRequired,
	};

	render() {
		const { user } = this.props;

		return (
			<Connect
				mapSubscriptionToProps={{
					data: {
						key: {
							slice: {
								type: 'roomrel',
								link: {
									room: 'item',
								},
								filter: {
									user,
									roles_cts: [ ROLE_FOLLOWER ],
								},
								order: 'createTime',
							},
							range: {
								start: -Infinity,
								end: Infinity,
							},
						},
						transform: transformResults,
					},
				}}
				passProps={this.props}
				component={Rooms}
			/>
		);
	}
}

export default PassUserProp(RoomsContainer);
