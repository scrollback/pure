/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import DiscussionActionSheet from '../views/Discussion/DiscussionActionSheet';
import {
	hideThread,
	unhideThread,
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
	banUser: user => dispatch(banUser(user)),
	unbanUser: user => dispatch(unbanUser(user)),
});

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps, mapDispatchToProps),
	createTransformPropsContainer(transformFunction),
)(DiscussionActionSheet);
