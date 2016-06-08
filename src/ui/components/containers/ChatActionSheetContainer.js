/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
import ChatActionSheet from '../views/Chat/ChatActionSheet';
import {
	hideThread,
	unhideThread,
	hideText,
	unhideText,
	banUser,
	unbanUser,
} from '../../../modules/store/actions';
import { TAG_USER_ADMIN } from '../../../lib/Constants';

const hasAdminTag = user => (user && user.tags && user.tags.indexOf(TAG_USER_ADMIN) > -1);

const transformFunction = props => {
	if (props.data) {
		return {
			...props,
			isUserAdmin: hasAdminTag(props.data),
		};
	}
	return props;
};

const mapSubscriptionToProps = {
	data: {
		key: 'me',
	},
};

const mapDispatchToProps = dispatch => ({
	hideThread: (thread, tags) => dispatch(hideThread(thread, tags)),
	unhideThread: (thread, tags) => dispatch(unhideThread(thread, tags)),
	hideText: (text, tags) => dispatch(hideText(text, tags)),
	unhideText: (text, tags) => dispatch(unhideText(text, tags)),
	banUser: user => dispatch(banUser(user)),
	unbanUser: user => dispatch(unbanUser(user)),
});

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps, mapDispatchToProps),
	createTransformPropsContainer(transformFunction)
)(ChatActionSheet);
