/* @flow */

import createContainer from '../../../modules/store/createContainer';
import NotificationClearIcon from '../views/Notification/NotificationClearIcon';
import { dismissAllNotes } from '../../../modules/store/actions';

const mapDispatchToProps = dispatch => ({
	dismissAllNotes: () => dispatch(dismissAllNotes()),
});

export default createContainer(null, mapDispatchToProps)(NotificationClearIcon);
