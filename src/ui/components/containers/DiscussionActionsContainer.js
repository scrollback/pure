/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import DiscussionActions from '../views/Discussion/DiscussionActions';
import {
	likeThread,
	unlikeThread,
} from '../../../modules/store/actions';

const mapDispatchToProps = dispatch => ({
	likeThread: (thread, user, roles) => dispatch(likeThread(thread, user, roles)),
	unlikeThread: (thread, user, roles) => dispatch(unlikeThread(thread, user, roles)),
});

export default flowRight(
	createUserContainer(),
	createContainer(null, mapDispatchToProps),
)(DiscussionActions);
