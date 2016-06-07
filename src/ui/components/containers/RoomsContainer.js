/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
import Rooms from '../views/Homescreen/Rooms';
import { TAG_USER_CONTENT, TAG_USER_ADMIN } from '../../../lib/Constants';

const isModerator = user => {
	return user && user.tags && (user.tags.indexOf(TAG_USER_ADMIN) > -1 || user.tags.indexOf(TAG_USER_CONTENT) > -1);
};

const mapSubscriptionToProps = () => ({
	rooms: {
		key: {
			type: 'state',
			path: 'roomList',
		},
	},
	data: {
		key: 'me',
	},
});

const transformFunction = props => {
	if (props.data) {
		return {
			...props,
			moderator: isModerator(props.data),
		};
	}
	return props;
};

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps),
	createTransformPropsContainer(transformFunction),
)(Rooms);
