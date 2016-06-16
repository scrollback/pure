/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import MyActivityItem from '../views/Homescreen/MyActivityItem';

const mapSubscriptionToProps = ({ thread }) => ({
	room: {
		key: {
			type: 'entity',
			id: thread.parents[0],
		},
	},
});

export default flowRight(
	createContainer(mapSubscriptionToProps),
	createUserContainer(),
)(MyActivityItem);
