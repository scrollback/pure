/* @flow */

import React, { Component } from 'react';
import RoomListForModeration from '../views/Homescreen/RoomListForModeration';
import store from '../../../modules/store/store';

export default class RoomListForModerationContainer extends Component<void, any, void> {
	_getResults = (filter: string) => {
		return store.observe({
			slice: {
				type: 'room',
				filter: {
					name_pref: filter.trim(),
				},
				order: 'updateTime',
			},
			range: {
				start: -Infinity,
				before: 0,
				after: 10,
			},
			source: 'RoomListForModerationContainer',
		});
	};

	render() {
		return <RoomListForModeration {...this.props} getResults={this._getResults} />;
	}
}
