/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import AppbarTouchable from './AppbarTouchable';
import AppbarIcon from './AppbarIcon';

type Props = {
	shareLink: Function;
	thread: any;
}

export default class ShareButton extends Component<void, Props, void> {
	static propTypes = {
		shareLink: PropTypes.func.isRequired,
		thread: PropTypes.object.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handlePress = () => {
		this.props.shareLink(this.props.thread);
	};

	render() {
		return (
			<AppbarTouchable onPress={this._handlePress}>
				<AppbarIcon name='share' />
			</AppbarTouchable>
		);
	}
}
