/* @flow */

import React, { Component, PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import PassUserProp from '../../../modules/store/PassUserProp';
import Rooms from '../views/Rooms';
import { ROLE_FOLLOWER } from '../../../lib/Constants';

const filterInvalidRels = data => data.filter(result => (
	typeof result.type === 'string' ||
	(result.room && typeof result.room.type !== 'string') &&
	(result.roomrel && typeof result.roomrel.type !== 'string')
));

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
						transform: filterInvalidRels,
					},
				}}
				passProps={this.props}
				component={Rooms}
			/>
		);
	}
}

export default PassUserProp(RoomsContainer);
