/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import ChatTitle from '../views/Chat/ChatTitle';
import {
	ROLE_FOLLOWER,
	PRESENCE_FOREGROUND,
} from '../../../lib/Constants';

const getOnlineCount = result => {
	if (result) {
		if (result[0] && result[0].type === 'loading') {
			return 0;
		} else {
			return result.filter(item => item && item.rel && item.rel.presence === PRESENCE_FOREGROUND).length;
		}
	} else {
		return 0;
	}
};

const ChatTitleContainer = (props: any) => {
	return (
		<Connect
			mapSubscriptionToProps={{
				thread: {
					key: {
						type: 'entity',
						id: props.thread,
					},
				},
				online: {
					key: {
						slice: {
							type: 'rel',
							link: {
								user: 'user',
							},
							filter: {
								item: props.thread,
								roles_cts: [ ROLE_FOLLOWER ],
							},
							order: 'presenceTime',
						},
						range: {
							start: Infinity,
							before: 100,
							after: 0,
						},
					},
					transform: getOnlineCount,
				},
			}}
			passProps={props}
			component={ChatTitle}
		/>
	);
};

ChatTitleContainer.propTypes = {
	thread: PropTypes.string.isRequired,
};

export default ChatTitleContainer;
