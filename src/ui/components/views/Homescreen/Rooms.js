/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import RoomListForModerationContainer from '../../containers/RoomListForModerationContainer';
import RoomListContainer from '../../containers/RoomListContainer';

type Props = {
	moderator: boolean;
}

export default class Rooms extends Component<void, Props, void> {
	static propTypes = {
		moderator: PropTypes.bool,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		if (this.props.moderator) {
			return <RoomListForModerationContainer {...this.props} />;
		} else {
			return <RoomListContainer {...this.props} />;
		}
	}
}
