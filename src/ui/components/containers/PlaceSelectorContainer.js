/* @flow */

import createContainer from '../../../modules/store/createContainer';
import PlacesSelector from '../views/Account/PlacesSelector';

const mapSubscriptionToProps = () => ({
	location: {
		key: {
			type: 'state',
			path: 'location',
		},
	},
});

export default createContainer(mapSubscriptionToProps)(PlacesSelector);
