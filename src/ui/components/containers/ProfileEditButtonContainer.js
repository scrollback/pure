
/* @flow */

import createContainer from '../../../modules/store/createContainer';
import ProfileEditButton from '../views/Profile/ProfileEditButton';

const mapSubscriptionToProps = () => ({
	currentUser: {
		key: {
			type: 'state',
			path: 'user',
		},
	},
});

export default createContainer(mapSubscriptionToProps)(ProfileEditButton);
