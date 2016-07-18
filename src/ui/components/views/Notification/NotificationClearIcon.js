/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import AppbarTouchable from '../Appbar/AppbarTouchable';
import AppbarIcon from '../Appbar/AppbarIcon';

type Props = {
	notes: Array<Object>;
	dismissAllNotes: Function;
}

export default class NotificationClearIcon extends Component<void, Props, void> {
	static propTypes = {
		notes: PropTypes.arrayOf(PropTypes.object).isRequired,
		dismissAllNotes: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handlePress = () => {
		this.props.dismissAllNotes(this.props.notes);
	};

	render() {
		return (
			<AppbarTouchable onPress={this._handlePress}>
				<AppbarIcon name='clear-all' />
			</AppbarTouchable>
		);
	}
}
