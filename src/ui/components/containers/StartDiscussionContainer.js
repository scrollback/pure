/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import StartDiscussion from '../views/StartDiscussion/StartDiscussion';
import { startThread } from '../../../modules/store/actions';
import store from '../../../modules/store/store';

const mapDispatchToProps = dispatch => ({
	startThread: data => {
		const action: any = startThread(data);

		dispatch(action);

		return store.observe({
			type: 'entity',
			id: Object.keys(action.payload.entities)[0],
			source: 'StartDiscussionContainer',
		});
	},
});

export default flowRight(
	createUserContainer(),
	createContainer(null, mapDispatchToProps),
)(StartDiscussion);
