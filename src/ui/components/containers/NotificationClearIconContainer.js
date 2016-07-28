/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import NotificationClearIcon from '../views/Notification/NotificationClearIcon';
import { dismissAllNotes } from '../../../modules/store/actions';

const mapDispatchToProps = dispatch => ({
	dismissAllNotes: notes => dispatch(dismissAllNotes(notes)),
});

export default flowRight(
	createUserContainer(),
	createContainer(null, mapDispatchToProps),
)(NotificationClearIcon);
