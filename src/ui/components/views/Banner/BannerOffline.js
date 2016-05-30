/* @flow */

import React, { PropTypes, Component } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import Banner from './Banner';

type Props = {
	status: 'connecting' | 'online' | 'offline'
}

export default class BannerOffline extends Component<void, Props, void> {
	static propTypes = {
		status: PropTypes.oneOf([ 'connecting', 'offline', 'online' ]),
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
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
