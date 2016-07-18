/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import NotificationClearIcon from '../views/Notification/NotificationClearIcon';
import { dismissAllNotes } from '../../../modules/store/actions';

const mapDispatchToProps = dispatch => ({
	dismissAllNotes: notes => dispatch(dismissAllNotes(notes)),
});

const mapSubscriptionToProps = ({ user }) => ({
	notes: {
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
				before: 20,
				after: 0,
			},
		},
	},
});

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps, mapDispatchToProps),
)(NotificationClearIcon);
