/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
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

const transformFunction = props => {
	if (props.data) {
		return {
			...props,
			online: getOnlineCount(props.data),
		};
	}
	return props;
};

const mapSubscriptionToProps = ({ thread }) => ({
	thread: {
		key: {
			type: 'entity',
			id: thread,
		},
	},
	data: {
		key: {
			slice: {
				type: 'rel',
				link: {
					user: 'user',
				},
				filter: {
					rel: {
						item: thread,
						roles_cts: [ ROLE_FOLLOWER ],
					},
				},
				order: 'presenceTime',
			},
			range: {
				start: Infinity,
				before: 100,
				after: 0,
			},
		},
	},
});

export default flowRight(
	createContainer(mapSubscriptionToProps),
	createTransformPropsContainer(transformFunction),
)(ChatTitle);
