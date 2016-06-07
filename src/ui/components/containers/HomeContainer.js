/* @flow */

import createContainer from '../../../modules/store/createContainer';
import Home from '../views/Home';

const mapSubscriptionToProps = () => ({
	initialURL: {
		key: {
			type: 'state',
			path: 'initialURL',
		},
	},
});

export default createContainer(mapSubscriptionToProps)(Home);
