/* @flow */

import flowRight from 'lodash/flowRight';
import { config } from '../../../core-client';
import createContainer from '../../../modules/store/createContainer';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
import ShareButton from '../views/Appbar/ShareButton';
import { convertRouteToURL } from '../../../lib/Route';

const { host, protocol } = config.server;

const transformThreadToUrl = thread => thread && thread.type !== 'loading' ? protocol + '//' + host + convertRouteToURL({
	name: 'chat',
	props: {
		room: thread.parents[0],
		thread: thread.id,
	},
}) : null;

function mapSubscriptionToProps({ thread }) {
	return {
		data: {
			key: {
				type: 'entity',
				id: thread,
			},
			transform: transformThreadToUrl,
		},
	};
}

function transformFunction(props) {
	if (props.data) {
		return {
			...props,
			url: transformThreadToUrl(props.data),
		};
	}
	return props;
}

export default flowRight(
	createContainer(mapSubscriptionToProps),
	createTransformPropsContainer(transformFunction),
)(ShareButton);
