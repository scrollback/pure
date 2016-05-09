/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowEqual from 'shallowequal';
import AppbarTouchable from './AppbarTouchable';
import AppbarIcon from './AppbarIcon';

type Props = {
	dismissAllNotes: Function;
}

export default class NotificationClearIcon extends Component<void, Props, void> {
	static propTypes = {
		dismissAllNotes: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		return (
			<AppbarTouchable onPress={this.props.dismissAllNotes}>
				<AppbarIcon name='clear-all' />
			</AppbarTouchable>
		);
	}
}
