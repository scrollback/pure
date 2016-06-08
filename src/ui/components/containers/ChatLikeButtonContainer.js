/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import ChatLikeButton from '../views/Chat/ChatLikeButton';
import {
	likeThread,
	unlikeThread,
	likeText,
	unlikeText,
} from '../../../modules/store/actions';

const mapDispatchToProps = dispatch => ({
	likeThread: (thread, user, roles) => dispatch(likeThread(thread, user, roles)),
	unlikeThread: (thread, user, roles) => dispatch(unlikeThread(thread, user, roles)),
	likeText: (text, user, roles) => dispatch(likeText(text, user, roles)),
	unlikeText: (text, user, roles) => dispatch(unlikeText(text, user, roles)),
});

export default flowRight(
	createUserContainer(),
	createContainer(null, mapDispatchToProps),
)(ChatLikeButton);
