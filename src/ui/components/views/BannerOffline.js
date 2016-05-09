/* @flow */

import React, { PropTypes, Component } from 'react';
import shallowEqual from 'shallowequal';
import Banner from './Banner';

type Props = {
	status: 'connecting' | 'online' | 'offline'
}

export default class BannerOffline extends Component<void, Props, void> {
	static propTypes = {
		status: PropTypes.oneOf([ 'connecting', 'offline', 'online' ]),
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		const { status } = this.props;

		let label;

		switch (status) {
		case 'online':
			label = '';
			break;
		case 'offline':
			label = 'Network unavailable. Waiting for connection…';
			break;
		default:
			label = 'Connecting to server…';
		}

		return (
			<Banner
				text={label}
				showClose={false}
			/>
		);
	}
}
