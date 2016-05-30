/* @flow */

import React, { PropTypes } from 'react';
import Avatar from '../views/Avatar/Avatar';
import { config } from '../../../core-client';

const { host, protocol } = config.server;

const AvatarContainer = (props: any) => (
	<Avatar { ...props } uri={`${protocol}//${host}/i/picture?user=${props.user}&size=${props.size}`} />
);

AvatarContainer.defaultProps = {
	size: 48,
};

AvatarContainer.propTypes = {
	user: PropTypes.string,
	size: PropTypes.number,
};

export default AvatarContainer;
