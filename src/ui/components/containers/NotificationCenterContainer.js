/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import createPaginatedContainer from '../../../modules/store/createPaginatedContainer';
import NotificationCenter from '../views/Notification/NotificationCenter';
import { dismissNote } from '../../../modules/store/actions';

const mapDispatchToProps = dispatch => ({
	dismissNote: note => dispatch(dismissNote(note)),
});

function sliceFromProps({ user }) {
	return {
		type: 'note',
		filter: {
			user,
		},
		order: 'updateTime',
	};
}

export default flowRight(
	createUserContainer(),
	createPaginatedContainer(sliceFromProps, 20),
	createContainer(null, mapDispatchToProps),
)(NotificationCenter);
