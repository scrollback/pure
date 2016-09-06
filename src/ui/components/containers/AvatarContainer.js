/* @flow */

import React, { Component, PropTypes } from 'react';
import Avatar from '../views/Avatar/Avatar';
import createContainer from '../../../modules/store/createContainer';
import { config } from '../../../core-client';
import type { User } from '../../../lib/schemaTypes';

const { host, protocol } = config.server;

type Props = {
	me: ?User;
	user: string;
	size: number;
}

type DefaultProps = {
	size: number;
}

class AvatarContainer extends Component<DefaultProps, Props, void> {
	static propTypes = {
		me: PropTypes.object,
		user: PropTypes.string,
		size: PropTypes.number,
	};

	static defaultProps = {
		size: 48,
	};

	render() {
		const { me, user, size } = this.props;

		let uri = `${protocol}//${host}/i/picture?user=${user}&size=${size}`;

		if (me && me.id === user && me.params && me.params.lastPictureUpdateTime) {
			uri += '&key=' + me.params.lastPictureUpdateTime;
		}

		return <Avatar {...this.props} uri={uri} />;
	}
}

const mapSubscriptionToProps = {
	me: {
		type: 'me',
	},
};

export default createContainer(mapSubscriptionToProps)(AvatarContainer);
