/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
import NotificationBadge from '../views/Notification/NotificationBadge';

const transformNotesToCount = (/* data */) => {
	// TODO: handle notifications properly
	// if (data && data.length) {
	// 	if (data.length === 1 && data[0] && data[0].type === 'loading') {
	// 		return 0;
	// 	} else {
	// 		return data.length;
	// 	}
	// } else {
	// 	return 0;
	// }
	return 0;
};

const transformFunction = props => {
	if (props.data) {
		return {
			...props,
			count: transformNotesToCount(props.data),
		};
	}
	return props;
};

const mapSubscriptionToProps = ({ user }) => ({
	data: {
		key: {
			slice: {
				type: 'note',
				filter: {
					user,
				},
				order: 'updateTime',
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
	createUserContainer(),
	createContainer(mapSubscriptionToProps),
	createTransformPropsContainer(transformFunction),
)(NotificationBadge);
