/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
import NotificationCenter from '../views/Notification/NotificationCenter';
import { dismissNote } from '../../../modules/store/actions';

const transformFunction = props => {
	return {
		...props,
		data: [],
	};
};

const mapDispatchToProps = dispatch => ({
	dismissNote: id => dispatch(dismissNote(id)),
});

const mapSubscriptionToProps = ({ user }) => ({
	data: {
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
				before: 100,
				after: 0,
			},
		},
	},
});

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps, mapDispatchToProps),
	createTransformPropsContainer(transformFunction)
)(NotificationCenter);
