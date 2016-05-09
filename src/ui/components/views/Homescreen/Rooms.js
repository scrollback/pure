/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowEqual from 'shallowequal';
import RoomListForModeration from './RoomListForModeration';
import RoomListContainer from '../../containers/RoomListContainer';

type Props = {
	rooms: ?Array<Object>;
}

export default class Rooms extends Component<void, Props, void> {
	static propTypes = {
		rooms: PropTypes.array,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		const {
			rooms,
		} = this.props;

		if (rooms && rooms.length) {
			return <RoomListForModeration {...this.props} data={rooms} />;
		} else {
			return <RoomListContainer {...this.props} />;
		}
	}
}
